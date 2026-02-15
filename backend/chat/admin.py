from django.contrib import admin
from .models.chats import Thread, ChatMessage

@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_person', 'second_person', 'updated')
    search_fields = ('first_person__username', 'second_person__username')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'thread', 'user', 'message', 'timestamp')
    search_fields = ('user__username', 'message')
    list_filter = ('timestamp',)
