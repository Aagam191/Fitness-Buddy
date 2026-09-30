from ..models import User_details
from ..serializers import UserDetailsSerializer


class ProfileService:
    """
    Domain service for user fitness details and profile metrics.
    """

    @staticmethod
    def get_user_profiles(user):
        records = User_details.objects.filter(username=user.username)
        serializer = UserDetailsSerializer(records, many=True)
        return serializer.data

    @staticmethod
    def save_user_profile(user, data: dict):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        payload['username'] = user.username
        serializer = UserDetailsSerializer(data=payload)
        if serializer.is_valid():
            serializer.save(user=user, username=user.username)
            return True, serializer.data
        return False, serializer.errors
