import os
import requests
from dotenv import load_dotenv
load_dotenv(".env")
api_key = os.getenv("ELEVENLABS_API_KEY")

url = "https://api.elevenlabs.io/v1/user"
headers = {"xi-api-key": api_key}
print(f"API Key starting with: {api_key[:10]}...")
response = requests.get(url, headers=headers)
print("Status:", response.status_code)
print("Response:", response.text)
