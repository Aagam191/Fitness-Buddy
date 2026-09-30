# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'isPremiumUser']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            isPremiumUser=validated_data.get('isPremiumUser', False),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials")


from .models import User_details

class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_details
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True, 'required': False},
            'username': {'required': False},
        }


from .models import Exercise, PaymentTransaction, WorkoutLog, WorkoutSet, DietPlanHistory


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class PaymentTransactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = ['id', 'username', 'order_id', 'payment_id', 'amount', 'currency', 'status', 'created_at']


class WorkoutSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSet
        fields = ['id', 'exercise_name', 'set_number', 'reps', 'weight_kg']


class WorkoutLogSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutLog
        fields = ['id', 'title', 'date', 'duration_minutes', 'notes', 'sets', 'created_at']


class DietPlanHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlanHistory
        fields = ['id', 'bmi', 'bmr', 'total_calories', 'plan_data', 'created_at']


from .models import TrainingProgram, ProgramWeek, ProgramDay, ProgramExercise, UserProgramEnrollment


class ProgramExerciseSerializer(serializers.ModelSerializer):
    video_front = serializers.CharField(source='exercise.video_front', read_only=True, default='')
    video_side = serializers.CharField(source='exercise.video_side', read_only=True, default='')
    body_part = serializers.CharField(source='exercise.body_part', read_only=True, default='')

    class Meta:
        model = ProgramExercise
        fields = [
            'id', 'exercise_name', 'order', 'target_sets', 'target_reps',
            'rest_seconds', 'target_rpe', 'coaching_cue', 'video_front', 'video_side', 'body_part'
        ]


class ProgramDaySerializer(serializers.ModelSerializer):
    exercises = ProgramExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = ProgramDay
        fields = ['id', 'day_number', 'title', 'is_rest_day', 'estimated_duration_min', 'warmup_notes', 'exercises']


class ProgramWeekSerializer(serializers.ModelSerializer):
    days = ProgramDaySerializer(many=True, read_only=True)

    class Meta:
        model = ProgramWeek
        fields = ['id', 'week_number', 'phase_title', 'focus_summary', 'target_rpe', 'days']


class TrainingProgramListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'slug', 'title', 'subtitle', 'description',
            'goal', 'difficulty', 'days_per_week', 'duration_weeks',
            'is_premium', 'banner_gradient', 'created_at'
        ]


class TrainingProgramDetailSerializer(serializers.ModelSerializer):
    weeks = ProgramWeekSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'slug', 'title', 'subtitle', 'description',
            'goal', 'difficulty', 'days_per_week', 'duration_weeks',
            'is_premium', 'banner_gradient', 'weeks', 'created_at'
        ]


class UserProgramEnrollmentSerializer(serializers.ModelSerializer):
    program = TrainingProgramListSerializer(read_only=True)

    class Meta:
        model = UserProgramEnrollment
        fields = [
            'id', 'program', 'started_at', 'is_active',
            'completed_days', 'current_week', 'current_day'
        ]



