from ..models import WorkoutLog, WorkoutSet
from ..serializers import WorkoutLogSerializer


class WorkoutService:
    """
    Domain service for user workout logging, exercise sets, and tracking history.
    """

    @staticmethod
    def get_user_workouts(user):
        return WorkoutLog.objects.filter(user=user).prefetch_related('sets')

    @staticmethod
    def log_workout(user, data: dict):
        title = data.get('title', 'Daily Workout')
        date = data.get('date')
        duration = data.get('duration_minutes', 45)
        notes = data.get('notes', '')
        sets_data = data.get('sets', [])

        log_kwargs = {
            'user': user,
            'title': title,
            'duration_minutes': duration,
            'notes': notes,
        }
        if date:
            log_kwargs['date'] = date

        workout = WorkoutLog.objects.create(**log_kwargs)

        sets_to_create = []
        for idx, s in enumerate(sets_data):
            sets_to_create.append(
                WorkoutSet(
                    workout_log=workout,
                    exercise_name=s.get('exercise_name', 'Exercise'),
                    set_number=s.get('set_number', idx + 1),
                    reps=s.get('reps', 10),
                    weight_kg=s.get('weight_kg', 0.0),
                )
            )

        if sets_to_create:
            WorkoutSet.objects.bulk_create(sets_to_create)

        return WorkoutLogSerializer(workout).data

    @staticmethod
    def delete_workout(user, workout_id: int):
        workout = WorkoutLog.objects.filter(id=workout_id, user=user).first()
        if workout:
            workout.delete()
            return True, "Workout deleted successfully"
        return False, "Workout not found"
