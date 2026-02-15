from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models.chats import Thread, ChatMessage

User = get_user_model()


class ChatUserSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for chat contexts."""
    class Meta:
        model = User
        fields = ('id', 'username', 'display_name', 'is_bot')
        read_only_fields = fields


class ChatMessageSerializer(serializers.ModelSerializer):
    user = ChatUserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'user', 'message', 'timestamp')
        read_only_fields = ('id', 'user', 'timestamp')


class ThreadSerializer(serializers.ModelSerializer):
    """
    Returns the thread with the 'other' user (relative to request.user)
    and a preview of the last message.
    """
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ('id', 'other_user', 'last_message', 'updated')
        read_only_fields = fields

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        other = obj.second_person if obj.first_person == request.user else obj.first_person
        return ChatUserSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.chatmessage_thread.order_by('-timestamp').first()
        if msg:
            return {
                'message': msg.message,
                'timestamp': msg.timestamp,
                'user_id': msg.user_id,
            }
        return None
