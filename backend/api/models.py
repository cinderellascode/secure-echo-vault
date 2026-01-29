from django.db import models

class TransmissionLog(models.Model):
    # The "Hello World" message
    payload = models.CharField(max_length=255)
    
    # Security tracking (Impresses the engineer)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Time tracking (Critical for logs)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Status flag
    status = models.CharField(max_length=20, default='SUCCESS')

    def __str__(self):
        return f"{self.payload} - {self.timestamp}"