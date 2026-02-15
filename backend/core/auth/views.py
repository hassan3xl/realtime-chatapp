from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from core.authentication import CsrfExemptSessionAuthentication
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user, backend='core.backends.UsernamePhoneBackend')
        return Response(
            {"detail": "Registration successful", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
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


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class MeAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(
            {"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED
        )
