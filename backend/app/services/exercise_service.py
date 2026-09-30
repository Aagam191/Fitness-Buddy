from ..models import Exercise
from ..serializers import ExerciseSerializer


class ExerciseService:
    """
    Domain service for cataloging and querying body-part exercises.
    """

    @staticmethod
    def get_exercises_by_body_part(body_part: str):
        if not body_part:
            return Exercise.objects.none()
        cleaned = body_part.strip().lower()
        return Exercise.objects.filter(body_part__iexact=cleaned)

    @staticmethod
    def get_all_exercises():
        return Exercise.objects.all()
