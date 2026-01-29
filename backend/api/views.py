from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TransmissionLog
import time
import random 

@api_view(['POST'])
def secure_handshake(request):
    start_time = time.time()
    
    # 1. Get Voice Input
    voice_data = request.data.get('voice_input', '').lower().strip()
    SECRET_KEY = "hello world"
    # SECRET_KEY = "hello world"
    
    response_data = {}
    
    # 2. Verify Password
    if voice_data == SECRET_KEY:
        # INNOVATION: Generate a 4-digit PIN
        secure_pin = random.randint(1000, 9999)
        
        # CRITICAL FIX: This sends the exact signal the Frontend needs
        response_data = {
            "access": "STEP_1_PASSED", 
            "audio_otp": str(secure_pin), 
            "server_message": "Voice Verified. Listen for your Audio OTP."
        }
        log_status = "VOICE_MATCH_WAITING_OTP"
    else:
        response_data = {
            "access": "DENIED",
            "server_message": "Voice Mismatch. Access Denied."
        }
        log_status = "ACCESS_DENIED"

    # 3. Log it
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

    TransmissionLog.objects.create(
        # Note: I changed 'Attempt' to 'Voice' so you can see the difference in logs
        payload=f"Voice: {voice_data}", 
        ip_address=ip,
        status=log_status
    )
    
    return Response(response_data)


