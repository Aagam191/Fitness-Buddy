from django.core.management.base import BaseCommand
from app.models import Exercise
import json
import os

class Command(BaseCommand):
    help = 'Seeds initial exercises into the database'

    def handle(self, *args, **options):
        fixture_path = os.path.join(os.path.dirname(__file__), '..', '..', 'fixtures_exercises.json')
        if not os.path.exists(fixture_path):
            self.stdout.write(self.style.ERROR(f"Fixture not found at {fixture_path}"))
            return

        with open(fixture_path, 'r') as fp:
            exercises_data = json.load(fp)

        created_count = 0
        updated_count = 0

        for item in exercises_data:
            obj, created = Exercise.objects.update_or_create(
                name=item['name'],
                body_part=item['body_part'],
                defaults={
                    'video_front': item.get('video_front', ''),
                    'video_side': item.get('video_side', ''),
                    'instructions': item.get('instructions', []),
                    'difficulty': item.get('difficulty', 'Intermediate'),
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded exercises: {created_count} created, {updated_count} updated."
            )
        )
