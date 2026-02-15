from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    # WhatsApp uses phone numbers as the primary identifier
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$', 
        message="Format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    
    # Custom display name (WhatsApp handles this differently than usernames)
    display_name = models.CharField(max_length=100, blank=True)

    # Bot flag — identifies system bot accounts
    is_bot = models.BooleanField(default=False)

    # Use phone_number as the login field instead of username
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username']

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='profiles/', default='default_avatar.png')
    bio = models.CharField(max_length=150, blank=True, default="Hey there! I am using WhatsApp.")
    
    # Real-time Status fields
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    # Privacy Settings
    is_private = models.BooleanField(default=False)
    blocked_users = models.ManyToManyField(User, related_name='blocked_by', blank=True)

    def __str__(self):
        return f"{self.user.phone_number}'s Profile"
    

class Contact(models.Model):
    user = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'friend')