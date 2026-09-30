from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import User


class AuthService:
    """
    Domain service for user authentication, registration, and JWT token management.
    """

    @staticmethod
    def register_user(request, username, email, password):
        if not username or not email or not password:
            return False, 'Missing required fields: username, email, and password are required', None

        if User.objects.filter(username=username).exists():
            return False, 'Username already taken', None

        if User.objects.filter(email=email).exists():
            return False, 'Email already registered', None

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                isPremiumUser=False,  # Enforce False on registration; premium requires payment verification
                is_superuser=False,
                is_staff=False,
            )
            login(request, user)
            refresh = RefreshToken.for_user(user)

            return True, 'User created successfully', {
                'username': user.username,
                'email': user.email,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }
        except Exception as e:
            return False, str(e), None

    @staticmethod
    def authenticate_user(request, username, password):
        if not username or not password:
            return False, 'Missing required fields', None

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)

            return True, 'Login successful', {
                'username': user.username,
                'email': user.email,
                'isPremiumUser': user.isPremiumUser,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }
        else:
            return False, 'Invalid credentials', None
