from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.users import User, Profile, Contact

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'phone_number', 'username', 'display_name', 'is_staff')
    search_fields = ('phone_number', 'username', 'display_name')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_online', 'last_seen', 'is_private')
    search_fields = ('user__phone_number', 'user__username')
    list_filter = ('is_online', 'is_private')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'friend', 'added_on')
    search_fields = ('user__phone_number', 'friend__phone_number')
    list_filter = ('added_on',)
