from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import login, logout

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterAPIView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Log the user in immediately after registration
        login(request, user, backend='core.backends.UsernamePhoneBackend')
        return Response(
            {"detail": "Registration successful", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user, backend='core.backends.UsernamePhoneBackend')
        return Response(
            {"detail": "Login successful", "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
