from django.shortcuts import get_object_or_404
from django.utils import timezone
from ..models import TrainingProgram, ProgramWeek, ProgramDay, ProgramExercise, UserProgramEnrollment, WorkoutLog, WorkoutSet
from ..serializers import (
    TrainingProgramListSerializer,
    TrainingProgramDetailSerializer,
    UserProgramEnrollmentSerializer,
    ProgramDaySerializer
)

class ProgramService:
    """
    Domain service for curated training programs, periodization schedule management,
    user enrollments, and workout completion tracking.
    """

    @classmethod
    def get_all_programs(cls, user=None):
        programs = TrainingProgram.objects.all().prefetch_related('weeks')
        data = TrainingProgramListSerializer(programs, many=True).data

        is_premium = user.is_authenticated and getattr(user, 'isPremiumUser', False)
        for item in data:
            item['is_unlocked'] = is_premium or not item.get('is_premium', True)
        return data

    @classmethod
    def get_program_detail(cls, slug: str, user=None):
        program = get_object_or_404(
            TrainingProgram.objects.prefetch_related('weeks__days__exercises__exercise'),
            slug=slug
        )
        is_premium = user and user.is_authenticated and getattr(user, 'isPremiumUser', False)
        data = TrainingProgramDetailSerializer(program).data

        # If user is not premium and program is premium, lock weeks 2 to 8
        if program.is_premium and not is_premium:
            for week in data.get('weeks', []):
                if week.get('week_number', 1) > 1:
                    week['is_locked'] = True
                    for day in week.get('days', []):
                        day['is_locked'] = True
                        day['exercises'] = []  # Mask exercises behind premium lock
                else:
                    week['is_locked'] = False
        else:
            for week in data.get('weeks', []):
                week['is_locked'] = False
                for day in week.get('days', []):
                    day['is_locked'] = False

        data['is_unlocked'] = is_premium or not program.is_premium
        return data

    @classmethod
    def enroll_user(cls, user, slug: str):
        program = get_object_or_404(TrainingProgram, slug=slug)
        if program.is_premium and not getattr(user, 'isPremiumUser', False):
            return False, "This curated 8-week program requires a MyFit Premium membership."

        # Deactivate any previous active enrollment
        UserProgramEnrollment.objects.filter(user=user, is_active=True).update(is_active=False)

        enrollment, _ = UserProgramEnrollment.objects.update_or_create(
            user=user,
            program=program,
            defaults={
                'started_at': timezone.localdate(),
                'is_active': True,
                'completed_days': [],
                'current_week': 1,
                'current_day': 1,
            }
        )
        return True, UserProgramEnrollmentSerializer(enrollment).data

    @classmethod
    def get_active_enrollment(cls, user):
        if not user or not user.is_authenticated:
            return None

        enrollment = UserProgramEnrollment.objects.filter(
            user=user,
            is_active=True
        ).select_related('program').first()

        if not enrollment:
            return None

        data = UserProgramEnrollmentSerializer(enrollment).data

        # Calculate total days in program and completed ratio
        total_days = ProgramDay.objects.filter(program_week__program=enrollment.program).count() or 56
        completed_count = len(enrollment.completed_days or [])
        progress_pct = round((completed_count / total_days) * 100, 1)

        data['total_days'] = total_days
        data['completed_count'] = completed_count
        data['progress_pct'] = min(progress_pct, 100.0)

        # Retrieve next upcoming day
        next_day = ProgramDay.objects.filter(
            program_week__program=enrollment.program,
            program_week__week_number=enrollment.current_week,
            day_number=enrollment.current_day
        ).prefetch_related('exercises__exercise').first()

        data['next_day'] = ProgramDaySerializer(next_day).data if next_day else None
        return data

    @classmethod
    def complete_day(cls, user, day_id: int, log_workout: bool = False, workout_data: dict = None):
        enrollment = UserProgramEnrollment.objects.filter(user=user, is_active=True).first()
        if not enrollment:
            return False, "No active program enrollment found."

        day = get_object_or_404(ProgramDay, id=day_id)

        completed = list(enrollment.completed_days or [])
        if day_id not in completed:
            completed.append(day_id)
            enrollment.completed_days = completed

        # Advance current day and week pointers
        if day.day_number < 7:
            enrollment.current_day = day.day_number + 1
        elif enrollment.current_week < enrollment.program.duration_weeks:
            enrollment.current_week += 1
            enrollment.current_day = 1
        enrollment.save()

        # Optionally log session directly to WorkoutLog
        if log_workout and workout_data:
            from .workout_service import WorkoutService
            WorkoutService.log_workout(user, workout_data)

        return True, {
            'message': f"Day {day.day_number} marked as complete!",
            'current_week': enrollment.current_week,
            'current_day': enrollment.current_day,
            'completed_days_count': len(completed),
        }
