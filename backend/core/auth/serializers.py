from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for returning user info."""
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number', 'display_name', 'is_bot')
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    display_name = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ('username', 'phone_number', 'display_name', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Username or phone number")
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs['identifier']
        password = attrs['password']

        # The UsernamePhoneBackend accepts `username` kwarg and checks both fields
        user = authenticate(
            request=self.context.get('request'),
            username=identifier,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")

        attrs['user'] = user
        return attrs
