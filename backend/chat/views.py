from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from core.authentication import CsrfExemptSessionAuthentication
from .models.chats import Thread, ChatMessage
from .serializers import ThreadSerializer, ChatMessageSerializer


@method_decorator(csrf_exempt, name='dispatch')
class ThreadListView(APIView):
    """
    GET  — list threads for the authenticated user (most recent first).
    POST — create or retrieve a thread with another user.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        threads = Thread.objects.filter(
            Q(first_person=request.user) | Q(second_person=request.user)
        ).order_by('-updated')

        serializer = ThreadSerializer(threads, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """Create or return existing thread with another user."""
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if thread already exists
        thread = Thread.objects.filter(
            (Q(first_person=request.user) & Q(second_person=other_user)) |
            (Q(first_person=other_user) & Q(second_person=request.user))
        ).first()

        if not thread:
            thread = Thread.objects.create(first_person=request.user, second_person=other_user)

        serializer = ThreadSerializer(thread, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class MessageListView(APIView):
    """
    GET  — list messages for a thread.
    POST — send a message in a thread.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def _get_thread(self, request, thread_id):
        """Return the thread if the user is a participant, else None."""
        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return None

        if request.user not in (thread.first_person, thread.second_person):
            return None
        return thread

    def get(self, request, thread_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        thread = self._get_thread(request, thread_id)
        if not thread:
            return Response({"detail": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        messages = thread.chatmessage_thread.order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, thread_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

        thread = self._get_thread(request, thread_id)
        if not thread:
            return Response({"detail": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({"detail": "message is required."}, status=status.HTTP_400_BAD_REQUEST)

        msg = ChatMessage.objects.create(
            thread=thread,
            user=request.user,
            message=message_text,
        )
        # Touch the thread to update its timestamp
        thread.save()

        serializer = ChatMessageSerializer(msg)
        
        # Broadcast to channel layer
        channel_layer = get_channel_layer()
        serialized_data = {
            "id": msg.id,
            "thread_id": thread.id,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "display_name": request.user.display_name,
                "is_bot": request.user.is_bot,
                "is_online": True, # Sender is online by definition
                "last_seen": None,
            },
            "message": msg.message,
            "timestamp": msg.timestamp.isoformat(),
        }
        
        # Send to other user
        other_user = thread.second_person if thread.first_person == request.user else thread.first_person
        async_to_sync(channel_layer.group_send)(
            f"user_{other_user.id}",
            {
                "type": "chat.message",
                "data": serialized_data,
            },
        )
        
        # Send to sender (so they see it update instantly on other devices/tabs)
        async_to_sync(channel_layer.group_send)(
            f"user_{request.user.id}",
            {
                "type": "chat.message",
                "data": serialized_data,
            },
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
