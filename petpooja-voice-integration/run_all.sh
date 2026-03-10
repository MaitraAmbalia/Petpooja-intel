#!/bin/bash
echo "Starting Uvicorn and Ngrok on port 8000..."

# Start uvicorn in background
.venv/bin/python main.py &
UVICORN_PID=$!

sleep 2

# Start ngrok in foreground so user can see it
ngrok http 8000

# Trap CTRL+C
trap "kill $UVICORN_PID" EXIT
