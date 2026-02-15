from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Triggered every time a User is saved.
    'created' is True only when the record is first inserted.
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Ensures that if the User object is updated,
    the Profile is also saved/synced.
    """
    instance.profile.save()


@receiver(post_save, sender=User)
def send_welcome_bot_message(sender, instance, created, **kwargs):
    """
    When a new NON-bot user registers, create a chat thread with the
    bot user and send a welcome message.
    """
    if not created or instance.is_bot:
        return

    from chat.models.chats import Thread, ChatMessage

    try:
        bot = User.objects.get(is_bot=True)
    except User.DoesNotExist:
        # Bot hasn't been created yet — skip silently
        return

    # Create the thread (bot = first_person, new user = second_person)
    thread = Thread.objects.create(first_person=bot, second_person=instance)

    # Send the welcome message from the bot
    display = instance.display_name or instance.username
    ChatMessage.objects.create(
        thread=thread,
        user=bot,
        message=(
            f"Welcome to ChatApp, {display}! 👋\n"
            "I'm your friendly assistant bot. "
            "Feel free to start chatting with anyone here. Enjoy!"
        ),
    )