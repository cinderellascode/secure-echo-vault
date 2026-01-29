from rest_framework import serializers
from .models import TransmissionLog

class TransmissionLogSerializer(serializers.ModelSerializer):
    # Formatting the timestamp to be readable helps the frontend
    formatted_time = serializers.DateTimeField(source='timestamp', format="%d %b %Y %H:%M:%S", read_only=True)

    class Meta:
        model = TransmissionLog
        fields = ['id', 'payload', 'formatted_time', 'status']