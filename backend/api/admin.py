# backend/api/admin.py
from django.contrib import admin
from .models import TransmissionLog

@admin.register(TransmissionLog)
class TransmissionLogAdmin(admin.ModelAdmin):
    # This controls what columns show up in the list
    list_display = ('payload', 'ip_address', 'status', 'timestamp')
    
    # This adds a search bar (Very impressive for demos)
    search_fields = ('payload', 'ip_address')
    
    # This adds filters on the right side
    list_filter = ('status', 'timestamp')