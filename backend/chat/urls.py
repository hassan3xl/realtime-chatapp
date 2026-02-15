from django.urls import path
from .views import ThreadListView, MessageListView

urlpatterns = [
    path('threads/', ThreadListView.as_view(), name='thread-list'),
    path('threads/<int:thread_id>/messages/', MessageListView.as_view(), name='message-list'),
]
