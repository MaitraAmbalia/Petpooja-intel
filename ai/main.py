import os
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, Response
import uvicorn
from dotenv import load_dotenv

from agent import ConversationManager  # type: ignore
from audio import DeepgramTranscriber, SarvamSynthesizer  # type: ignore
load_dotenv()

app = FastAPI(title="Petpooja AI Voice Agent")

# Twilio Configuration
TWILIO_SERVER_HOST = os.getenv("TWILIO_SERVER_HOST", "unsashed-crenulate-vince.ngrok-free.dev")

@app.get("/")
async def root():
    return {"message": "Petpooja AI Voice Agent is running"}

@app.post("/incoming-call")
async def incoming_call(request: Request):
    """
    Twilio Webhook for incoming calls.
    Returns TwiML to connect to the /media-stream WebSocket.
    """
    form_data = await request.form()
    caller_number = form_data.get("From", "Unknown")
    print(f"[Twilio] Incoming call from {caller_number}")

    host_no_protocol = TWILIO_SERVER_HOST.replace("https://", "").replace("http://", "")
    
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://{host_no_protocol}/media-stream">
            <Parameter name="caller" value="{caller_number}"/>
        </Stream>
    </Connect>
</Response>"""
    return Response(content=twiml_response, media_type="text/xml")

@app.websocket("/media-stream")
async def media_stream(websocket: WebSocket):
    """
    WebSocket endpoint for Twilio Media Streams.
    Pipes audio to Deepgram (STT), text to Groq (LLM), and output text to ElevenLabs (TTS),
    then back to Twilio as audio.
    """
    await websocket.accept()
    print("[WebSocket] Connection accepted from Twilio")

    stream_sid = None
    caller_number = "Unknown"
    
    # In a fully production system, you would:
    # 1. Connect to Deepgram LiveClient here.
    # 2. Start a background task to receive Deepgram transcripts.
    # 3. For every final transcript, send to Groq Agent.
    # 4. Stream Groq's response chunks to ElevenLabs WebSocket.
    # 5. Receive mu-law audio from ElevenLabs and send to Twilio.

    # Initialize the Synthesizer
    synthesizer = SarvamSynthesizer()

    async def send_audio_to_twilio(base64_audio: str):
        if stream_sid:
            msg = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": base64_audio
                }
            }
            await websocket.send_json(msg)

    # Callback when Deepgram hears a final phrase
    async def on_transcript(transcript: str):
        print(f"[Agent hearing]: {transcript}")
        # Send text to Groq LLM
        ai_response = await agent.process_user_input(transcript)
        print(f"[Agent speaking]: {ai_response}")
        
        # Turn AI text response back into Audio
        audio_bytes = await synthesizer.synthesize_to_mulaw(ai_response)
        if audio_bytes:
            b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            await send_audio_to_twilio(b64_audio)
            
    # Initialize STT
    deepgram_ws = DeepgramTranscriber(on_transcript)

    try:
        while True:
            # Receive message from Twilio
            message = await websocket.receive_text()
            data = json.loads(message)

            if data['event'] == 'start':
                stream_sid = data['start']['streamSid']
                caller_number = data['start'].get('customParameters', {}).get("caller", "Unknown")
                print(f"[Twilio] Stream started. Stream SID: {stream_sid}, Caller: {caller_number}")
                
                # Re-initialize agent with caller number
                agent = ConversationManager(phone_number=caller_number)
                
                # Initialize Deepgram STT stream here
                await deepgram_ws.connect()
                
                # Say initial greeting via ElevenLabs TTS
                intro_text = await agent.get_initial_greeting()
                print(f"[Agent speaking]: {intro_text}")
                audio_bytes = await synthesizer.synthesize_to_mulaw(intro_text)
                if audio_bytes:
                    b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
                    await send_audio_to_twilio(b64_audio)
                
            elif data['event'] == 'media':
                # The payload contains base64 encoded audio from Twilio (8000Hz mulaw)
                audio_payload_base64 = data['media']['payload']
                audio_bytes = base64.b64decode(audio_payload_base64)
                
                # Send audio_bytes to Deepgram STT WebSocket
                await deepgram_ws.send_audio(audio_bytes)
                
            elif data['event'] == 'stop':
                print("[Twilio] Stream stopped.")
                break

    except Exception as e:
        print(f"[WebSocket] Error: {e}")
    finally:
        print("[WebSocket] Connection closed.")
        await deepgram_ws.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
