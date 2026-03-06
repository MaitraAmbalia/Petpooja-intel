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
        url = "wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&interim_results=true"
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        self.ws = await websockets.connect(url, additional_headers=headers, ssl=ssl_context)
        asyncio.create_task(self.receive_transcripts())
        print("[Deepgram] Connected.")

    async def receive_transcripts(self):
        try:
            async for message in self.ws:
                msg = json.loads(message)
                if msg.get("type") == "Results":
                    transcript = msg["channel"]["alternatives"][0]["transcript"]
                    is_final = msg.get("is_final", False)
                    
                    if transcript and is_final:
                        print(f"[User]: {transcript}")
                        await self.on_transcript(transcript)
        except Exception as e:
            print(f"[Deepgram] Error receiving transcripts: {e}")

    async def send_audio(self, audio_bytes: bytes):
        if self.ws:
            await self.ws.send(audio_bytes)

    async def close(self):
        if self.ws:
            await self.ws.close()
            print("[Deepgram] Disconnected.")


class ElevenLabsSynthesizer:
    """
    Connects to ElevenLabs to stream text to speech asynchronously.
    Can be used via HTTP or WebSocket.
    """
    def __init__(self, voice_id: str = "EXAVITQu4vr4xnSDxMaL"): # Example voice ID
        self.voice_id = voice_id
        
    async def synthesize_to_mulaw(self, text: str) -> bytes:
        """
        Synthesize text into PCM/mulaw audio.
        In production, using ElevenLabs WebSocket for streaming generation is preferred.
        For simplicity, this uses the HTTP API and returns the full audio buffer.
        """
        import httpx
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}/stream"
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        # Twilio requires 8000Hz mulaw or raw PCM
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        # Wait, elevenlabs by default outputs MP3. To output PCM for Twilio, we need the query param `output_format=pcm_16000` or similar.
        # But Twilio needs ulaw 8000. So we either decode it or request ulaw if elevenlabs supports it.
        # Elevenlabs supports `ulaw_8000` output format!
        url += "?output_format=ulaw_8000"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers, timeout=10.0)
            if response.status_code == 200:
                return response.content
            else:
                print(f"[ElevenLabs] Error: {response.text}")
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
