import subprocess
import time
import os

print("Starting Uvicorn and Ngrok on port 8000...")

# Start uvicorn process
uvicorn_process = subprocess.Popen(
    [".venv/bin/python", "main.py"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

time.sleep(2) # Wait for uvicorn to start

# Start ngrok process
ngrok_process = subprocess.Popen(
    ["ngrok", "http", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

print("\n--- Both processes are running! ---")
print("Ngrok is tunneling your Uvicorn server.")
print("Check your terminal running 'ngrok http 8000' directly to see the public URL.\n")

try:
    uvicorn_process.wait()
except KeyboardInterrupt:
    print("Shutting down processes...")
    uvicorn_process.terminate()
    ngrok_process.terminate()
