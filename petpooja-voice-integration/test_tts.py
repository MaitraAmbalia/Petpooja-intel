import os
import requests
from dotenv import load_dotenv

load_dotenv(".env")
api_key = os.getenv("DEEPGRAM_API_KEY")

url = "https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mulaw&sample_rate=8000"
headers = {
    "Authorization": f"Token {api_key}",
    "Content-Type": "application/json"
}
data = {
    "text": "Hello! I am the new Deepgram voice assistant. How can I help you today?"
}

response = requests.post(url, json=data, headers=headers)
print("Status Code:", response.status_code)
if response.status_code != 200:
    print("Error:", response.text)
else:
    print("Success: Audio generated! Received audio bytes:", len(response.content))
