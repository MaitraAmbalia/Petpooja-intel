import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Twilio Credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')  # The Twilio number you purchased
ngrok_host = os.getenv('TWILIO_SERVER_HOST', '')  # e.g. "your-url.ngrok.io"

client = Client(account_sid, auth_token)

def initiate_call(to_number: str):
    """
    Start an outbound call. When the user answers, Twilio will fetch the TwiML 
    from your ngrok `/incoming-call` endpoint, which connects them to the AI WebSocket.
    """
    if not ngrok_host:
        print("Please set TWILIO_SERVER_HOST in your .env file!")
        return
        
    call = client.calls.create(
        url=f"https://{ngrok_host}/incoming-call",
        to=to_number,
        from_=twilio_number
    )
    print(f"[Twilio] Dialing {to_number}...")
    print(f"[Twilio] Call SID: {call.sid}")

if __name__ == "__main__":
    # Replace this with the phone number you want to call (including country code, e.g., +91...)
    target_phone_number = "+917016285352"  
    
    # You must have your FastAPI server running and ngrok exposed before dialing
    initiate_call(target_phone_number)
