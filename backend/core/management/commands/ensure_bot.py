"""
Management command: ensure_bot

Creates the system bot user if it doesn't already exist.
Run after migrations:  python manage.py ensure_bot
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

BOT_USERNAME = 'chatbot'
BOT_PHONE = '+0000000000'
BOT_DISPLAY_NAME = 'ChatBot 🤖'


class Command(BaseCommand):
    help = 'Create the system ChatBot user if it does not exist.'

    def handle(self, *args, **options):
        bot, created = User.objects.get_or_create(
            username=BOT_USERNAME,
            defaults={
                'phone_number': BOT_PHONE,
                'display_name': BOT_DISPLAY_NAME,
                'is_bot': True,
                'is_active': True,
            },
        )
        if not created:
            # Ensure existing bot has the flag set
            if not bot.is_bot:
                bot.is_bot = True
                bot.save(update_fields=['is_bot'])

        # Bot doesn't need a usable password
        bot.set_unusable_password()
        bot.save(update_fields=['password'])

        action = 'Created' if created else 'Already exists'
        self.stdout.write(self.style.SUCCESS(f'{action}: {bot.username} (id={bot.id})'))
