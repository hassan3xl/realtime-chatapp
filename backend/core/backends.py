from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class UsernamePhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        try:
            user = User.objects.get(Q(username=username) | Q(phone_number=username))
        except User.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        return None
