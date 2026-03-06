import os
import json
import asyncio
from typing import Callable, Coroutine, Any
import websockets  # type: ignore
import ssl
from dotenv import load_dotenv  # type: ignore

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")


class DeepgramTranscriber:
    """
    Connects to Deepgram via WebSocket to stream Twilio mulaw audio
    and receive real-time text transcripts.
    """
    def __init__(self, on_transcript: Callable[[str], Coroutine[Any, Any, None]]):
        self.on_transcript = on_transcript
        self.ws: Any = None
        
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
                if isinstance(msg, dict) and msg.get("type") == "Results":
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


class SarvamSynthesizer:
    """
    Connects to Sarvam AI Text-to-Speech API.
    """
    def __init__(self, speaker: str = "shubh"): # Example speaker voice
        self.speaker = speaker
        
    async def synthesize_to_mulaw(self, text: str) -> bytes:
        """
        Synthesize text into audio using Sarvam API.
        The API returns a base64 string containing WAV/PCM. We need to decode it
        and convert it to 8000Hz mulaw for Twilio if necessary.
        """
        import httpx  # type: ignore
        import base64
        import io
        import wave
        import audioop

        url = "https://api.sarvam.ai/text-to-speech"
        
        headers = {
            "api-subscription-key": SARVAM_API_KEY or "",
            "Content-Type": "application/json"
        }
        
        data = {
            "inputs": [text],
            "target_language_code": "en-IN",
            "speaker": self.speaker,
            "speech_sample_rate": 8000,
            "model": "bulbul:v3"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data, headers=headers, timeout=10.0)
                if response.status_code == 200:
                    result = response.json()
                    audios = result.get("audios", [])
                    if not audios:
                        return b""
                        
                    # Sarvam returns base64 string of a complete WAV file
                    b64_str = audios[0]
                    wav_bytes = base64.b64decode(b64_str)
                    
                    # Convert the WAV PCM bytes to Twilio ulaw 8000Hz bytes
                    with wave.open(io.BytesIO(wav_bytes), 'rb') as wav_file:
                        n_channels = wav_file.getnchannels()
                        sampwidth = wav_file.getsampwidth()
                        framerate = wav_file.getframerate()
                        
                        pcm_data = wav_file.readframes(wav_file.getnframes())
                        
                        # Convert stereo to mono if needed
                        if n_channels > 1:
                            pcm_data = audioop.tomono(pcm_data, sampwidth, 1, 1)
                        
                        # Resample to 8000Hz if needed
                        if framerate != 8000:
                            pcm_data, state = audioop.ratecv(pcm_data, sampwidth, 1, framerate, 8000, None)
                            
                        # Convert 16-bit PCM to 8-bit mulaw
                        if sampwidth == 2:
                            mulaw_data = audioop.lin2ulaw(pcm_data, 2)
                            return mulaw_data
                        else:
                            print("[Sarvam] Unsupported sample width:", sampwidth)
                            return b""
                            
                else:
                    print(f"[Sarvam] Error: {response.text}")
                    return b""
        except Exception as e:
            print(f"[Sarvam] HTTP Exception: {e}")
            return b""
            
        return b""

class TranslatorAndLanguageDetector:
    """
    Multilingual support using langdetect and deep-translator.
    """
    def __init__(self):
        from langdetect import detect  # type: ignore
        from deep_translator import GoogleTranslator  # type: ignore
        self.detect = detect
        self.Translator = GoogleTranslator
        
    def detect_language(self, text: str) -> str:
        try:
            return self.detect(text)
        except Exception:
            return "en"
            
    def translate_to_english(self, text: str, source_lang: str) -> str:
        if source_lang == "en":
            return text
        return self.Translator(source=source_lang, target='en').translate(text)

    def translate_from_english(self, text: str, target_lang: str) -> str:
        if target_lang == "en":
            return text
        return self.Translator(source='en', target=target_lang).translate(text)
