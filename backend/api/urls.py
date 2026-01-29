from django.urls import path
from .views import secure_handshake

urlpatterns = [
    path('handshake/', secure_handshake, name='secure_handshake'),
]