from datetime import timedelta
from django.utils import timezone
from ..models import User_details, WorkoutLog, WorkoutSet, DietPlanHistory
from ..serializers import DietPlanHistorySerializer, UserDetailsSerializer, WorkoutLogSerializer


class AnalyticsService:
    """
    Domain service for calculating aggregated user metrics, workout volume,
    progress trends, and diet recommendations history.
    """

    @staticmethod
    def save_diet_plan(user, data: dict):
        bmi = data.get('bmi', 0.0)
        bmr = data.get('bmr', 0.0)
        total_calories = data.get('total_calories', 0.0)
        plan_data = data.get('plan_data', {})

        history = DietPlanHistory.objects.create(
            user=user,
            bmi=bmi,
            bmr=bmr,
            total_calories=total_calories,
            plan_data=plan_data,
        )
        return DietPlanHistorySerializer(history).data

    @staticmethod
    def get_user_diet_plans(user):
        return DietPlanHistory.objects.filter(user=user)

    @staticmethod
    def get_user_dashboard_stats(user):
        # Latest profile details
        latest_profile = User_details.objects.filter(username=user.username).last()
        profile_data = UserDetailsSerializer(latest_profile).data if latest_profile else None

        # Workout metrics
        total_workouts = WorkoutLog.objects.filter(user=user).count()
        total_sets = WorkoutSet.objects.filter(workout_log__user=user).count()
        
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        recent_workouts_count = WorkoutLog.objects.filter(
            user=user,
            date__gte=thirty_days_ago
        ).count()

        recent_workouts = WorkoutLog.objects.filter(user=user).prefetch_related('sets')[:5]
        recent_workouts_data = WorkoutLogSerializer(recent_workouts, many=True).data

        # Latest diet plan
        latest_diet = DietPlanHistory.objects.filter(user=user).first()
        latest_diet_data = DietPlanHistorySerializer(latest_diet).data if latest_diet else None

        return {
            'username': user.username,
            'is_premium': user.isPremiumUser,
            'profile': profile_data,
            'workout_summary': {
                'total_workouts': total_workouts,
                'total_sets': total_sets,
                'last_30_days_workouts': recent_workouts_count,
            },
            'recent_workouts': recent_workouts_data,
            'latest_diet_plan': latest_diet_data,
        }
