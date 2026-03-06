# Petpooja Voice AI Agent

This folder contains the Voice AI Agent backend powered by FastAPI, MongoDB (Motor), Groq, Deepgram, and ElevenLabs.

## Setup Instructions

1. **Environment Setup:**
   A virtual environment is already present. The required libraries including `langchain`, `fastapi`, `motor`, `websockets`, `deepgram-sdk`, `elevenlabs`, etc. have been installed.
   To activate your environment and ensure dependencies are there:
   ```bash
   uv pip install -r requirements.txt
   ```

2. **API Keys (Crucial):**
   Copy the `.env.example` placeholder to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill out:
   - `GROQ_API_KEY`
   - `DEEPGRAM_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`
   - `MONGODB_URI` (defaults to local mongodb `mongodb://localhost:27017`)

3. **Database (MongoDB):**
   Ensure your MongoDB server is running. The agent uses `motor` to connect asynchronously. It will automatically create databases/collections when inserting data. 
   - Operations like `create_order`, checking tables, and updating user histories exist in `database.py`. The data is saved in normal JSON formats which your Next.js application can seamlessly query and display!

## Running the Server

1. **Start the FastAPI server:**
   ```bash
   python main.py
   # Or using uvicorn: uvicorn main:app --port 8000 --reload
   ```

2. **Expose locally to internet:**
   Because Twilio needs a public webhook, use a tool like `ngrok`:
   ```bash
   ngrok http 8000
   ```

3. **Connect to Twilio:**
   - Go to your Twilio Console.
   - For your active phone number, set the **"When A Call Comes In"** webhook to your ngrok URL: 
     `https://<your-ngrok-url>.ngrok.io/incoming-call`
   - Also, open `.env` and update `TWILIO_SERVER_HOST="<your-ngrok-url>.ngrok.io"` (without the `https://`) so the agent knows where to pipe the WebSocket streams.

## Components Overview

- `main.py`: Contains the FastAPI server and the Twilio WebSocket routing (`/media-stream`).
- `agent.py`: Contains the actual AI brain using `ChatGroq`, defining the Waiter constraints, tools, and the logic to place logic into MongoDB.
- `database.py`: Contains schemas and Asyncio connection functions to MongoDB.
- `audio.py`: Helper classes to connect Deepgram streaming STT and Elevenlabs streaming TTS models, as well as `langdetect/deep-translator` logic for multilingual functionality.
