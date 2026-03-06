import os
import json
import base64
import asyncio
from typing import Callable, Coroutine, Any
import websockets
import ssl
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

class DeepgramTranscriber:
    """
    Connects to Deepgram via WebSocket to stream Twilio mulaw audio
    and receive real-time text transcripts.
    """
    def __init__(self, on_transcript: Callable[[str], Coroutine[Any, Any, None]]):
        self.on_transcript = on_transcript
        self.ws = None
        
    async def connect(self):
        url = "wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&interim_results=true&endpointing=500"
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        self.ws = await websockets.connect(url, additional_headers=headers, ssl=ssl_context)
        asyncio.create_task(self.receive_transcripts())
        print("[Deepgram] Connected.")

    async def receive_transcripts(self):
        try:
            transcript_buffer = ""
            async for message in self.ws:
                msg = json.loads(message)
                if msg.get("type") == "Results":
                    transcript = msg["channel"]["alternatives"][0]["transcript"]
                    is_final = msg.get("is_final", False)
                    speech_final = msg.get("speech_final", False)
                    
                    if transcript and not is_final:
                        await self.on_transcript(transcript, False)
                        
                    if is_final and transcript:
                        transcript_buffer += transcript + " "
                        
                    if speech_final:
                        text_to_send = transcript_buffer.strip()
                        if text_to_send:
                            await self.on_transcript(text_to_send, True)
                            transcript_buffer = ""
        except Exception as e:
            print(f"[Deepgram] Error receiving transcripts: {e}")

    async def send_audio(self, audio_bytes: bytes):
        if self.ws:
            await self.ws.send(audio_bytes)

    async def close(self):
        if self.ws:
            await self.ws.close()
            print("[Deepgram] Disconnected.")


class DeepgramSynthesizer:
    """
    Connects to Deepgram Aura for extremely fast, high-quality text to speech asynchronously.
    """
    def __init__(self, model: str = "aura-asteria-en"):
        self.model = model
        
    async def synthesize_to_mulaw(self, text: str) -> bytes:
        """
        Synthesize text into mulaw audio using Deepgram Aura.
        """
        import httpx
        url = f"https://api.deepgram.com/v1/speak?model={self.model}&encoding=mulaw&sample_rate=8000"
        
        headers = {
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=data, headers=headers, timeout=10.0)
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"[Deepgram TTS] Error: {response.text}")
                    return b""
            except Exception as e:
                print(f"[Deepgram TTS] Exception: {e}")
                return b""

class TranslatorAndLanguageDetector:
    """
    Multilingual support using langdetect and deep-translator.
    """
    def __init__(self):
        from langdetect import detect
        from deep_translator import GoogleTranslator
        self.detect = detect
        self.Translator = GoogleTranslator
        
    def detect_language(self, text: str) -> str:
        try:
            return self.detect(text)
        except:
            return "en"
            
    def translate_to_english(self, text: str, source_lang: str) -> str:
        if source_lang == "en":
             return text
        return self.Translator(source=source_lang, target='en').translate(text)
        
    def translate_from_english(self, text: str, target_lang: str) -> str:
        if target_lang == "en":
             return text
        return self.Translator(source='en', target=target_lang).translate(text)
