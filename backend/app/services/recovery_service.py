from datetime import timedelta
from django.utils import timezone
from ..models import WorkoutLog, WorkoutSet

class RecoveryService:
    """
    Biomechanical and physiological recovery service.
    Calculates per-muscle recovery status (0-100%), acute fatigue,
    and 7-day training volume load for interactive heatmap rendering and report generation.
    """

    ALL_MUSCLE_GROUPS = [
        'chest', 'biceps', 'triceps', 'shoulders', 'forearms',
        'abs', 'obliques', 'quads', 'hamstrings', 'glutes',
        'calves', 'lats', 'lowerback', 'traps', 'traps_middle'
    ]

    EXERCISE_MAP = {
        'bench': {'primary': ['chest'], 'secondary': ['triceps', 'shoulders']},
        'incline': {'primary': ['chest'], 'secondary': ['shoulders', 'triceps']},
        'squat': {'primary': ['quads'], 'secondary': ['glutes', 'calves', 'lowerback']},
        'deadlift': {'primary': ['hamstrings', 'lowerback'], 'secondary': ['glutes', 'forearms', 'traps']},
        'romanian': {'primary': ['hamstrings'], 'secondary': ['glutes', 'lowerback']},
        'row': {'primary': ['lats', 'traps_middle'], 'secondary': ['biceps', 'lowerback']},
        'pull-up': {'primary': ['lats'], 'secondary': ['biceps', 'traps_middle', 'forearms']},
        'pulldown': {'primary': ['lats'], 'secondary': ['biceps', 'traps_middle']},
        'overhead': {'primary': ['shoulders'], 'secondary': ['triceps', 'traps']},
        'shoulder': {'primary': ['shoulders'], 'secondary': ['triceps', 'traps']},
        'lateral': {'primary': ['shoulders'], 'secondary': []},
        'curl': {'primary': ['biceps'], 'secondary': ['forearms']},
        'hammer': {'primary': ['biceps', 'forearms'], 'secondary': []},
        'spider': {'primary': ['biceps'], 'secondary': []},
        'tricep': {'primary': ['triceps'], 'secondary': []},
        'pushdown': {'primary': ['triceps'], 'secondary': []},
        'skull': {'primary': ['triceps'], 'secondary': []},
        'calf': {'primary': ['calves'], 'secondary': []},
        'crunch': {'primary': ['abs'], 'secondary': ['obliques']},
        'twist': {'primary': ['obliques'], 'secondary': ['abs']},
        'leg raise': {'primary': ['abs'], 'secondary': ['obliques']},
        'leg press': {'primary': ['quads'], 'secondary': ['glutes']},
        'leg extension': {'primary': ['quads'], 'secondary': []},
    }

    @classmethod
    def _map_exercise_to_muscles(cls, exercise_name: str):
        name_lower = exercise_name.lower()
        primary = []
        secondary = []

        for key, mapping in cls.EXERCISE_MAP.items():
            if key in name_lower:
                for m in mapping.get('primary', []):
                    if m not in primary:
                        primary.append(m)
                for m in mapping.get('secondary', []):
                    if m not in secondary and m not in primary:
                        secondary.append(m)

        # Fallback if no specific keyword matched
        if not primary and not secondary:
            primary = ['chest']

        return primary, secondary

    @classmethod
    def get_athlete_heatmap_data(cls, user, lookback_days: int = 7):
        now = timezone.now()
        today = timezone.localdate()
        cutoff_date = today - timedelta(days=lookback_days)

        # Initialize baseline state for all 15 muscle groups
        muscles = {
            m: {
                'muscle_id': m,
                'name': m.replace('_', ' ').title(),
                'recovery_pct': 100,
                'status': 'READY',
                'volume_7d_kg': 0.0,
                'sets_7d': 0,
                'reps_7d': 0,
                'last_trained_hours': None,
                'last_trained_date': None,
            }
            for m in cls.ALL_MUSCLE_GROUPS
        }

        # Query recent workouts with sets
        workouts = WorkoutLog.objects.filter(
            user=user,
            date__gte=cutoff_date
        ).prefetch_related('sets').order_by('date', 'created_at')

        # Accumulate volume and timestamp per muscle
        for w in workouts:
            # Approximate elapsed hours from workout date
            days_ago = max(0, (today - w.date).days)
            hours_elapsed = (days_ago * 24) + 6 # Assume roughly midday session

            for s in w.sets.all():
                primaries, secondaries = cls._map_exercise_to_muscles(s.exercise_name)
                set_volume = float(s.weight_kg) * int(s.reps)

                for m in primaries:
                    if m in muscles:
                        muscles[m]['volume_7d_kg'] += set_volume
                        muscles[m]['sets_7d'] += 1
                        muscles[m]['reps_7d'] += s.reps
                        if muscles[m]['last_trained_hours'] is None or hours_elapsed < muscles[m]['last_trained_hours']:
                            muscles[m]['last_trained_hours'] = hours_elapsed
                            muscles[m]['last_trained_date'] = str(w.date)

                for m in secondaries:
                    if m in muscles:
                        muscles[m]['volume_7d_kg'] += (set_volume * 0.5)
                        muscles[m]['sets_7d'] += 0.5
                        muscles[m]['reps_7d'] += int(s.reps * 0.5)
                        if muscles[m]['last_trained_hours'] is None or hours_elapsed < muscles[m]['last_trained_hours']:
                            muscles[m]['last_trained_hours'] = hours_elapsed
                            muscles[m]['last_trained_date'] = str(w.date)

        # Compute physiological recovery score per muscle group
        total_recovery = 0
        total_volume_overall = 0.0
        fatigued_muscles = []
        ready_muscles = []

        for m, data in muscles.items():
            total_volume_overall += data['volume_7d_kg']
            hours = data['last_trained_hours']

            if hours is None or hours >= 72:
                # Fully recovered if not trained in >= 72h
                rec = 100
                status = 'READY'
            else:
                # Dynamic recovery based on volume load and hours elapsed
                load = data['volume_7d_kg']
                recovery_window = 42.0 + min(30.0, (load / 150.0))  # 42 to 72 hours
                raw_ratio = hours / recovery_window
                rec = min(100, max(15, int(round((raw_ratio ** 0.85) * 100))))

                if rec >= 80:
                    status = 'READY'
                elif rec >= 50:
                    status = 'RECOVERING'
                else:
                    status = 'FATIGUED'

            data['recovery_pct'] = rec
            data['status'] = status
            data['volume_7d_kg'] = round(data['volume_7d_kg'], 1)
            data['sets_7d'] = int(round(data['sets_7d']))
            total_recovery += rec

            if status == 'FATIGUED':
                fatigued_muscles.append(data['name'])
            elif status == 'READY':
                ready_muscles.append(data['name'])

        overall_readiness = int(round(total_recovery / len(muscles)))

        # Generate coaching recommendation based on biological readiness
        if fatigued_muscles:
            fatigued_str = ", ".join(fatigued_muscles[:3])
            ready_str = ", ".join(ready_muscles[:3]) if ready_muscles else "Light mobility"
            coaching_note = (
                f"Elevated fatigue detected in {fatigued_str}. Prioritize sleep, hydration, and nutrition. "
                f"Recommended target today: {ready_str}."
            )
        elif overall_readiness >= 90:
            coaching_note = (
                "Supercompensation active! All major muscle groups are primed for maximum mechanical tension and progressive overload."
            )
        else:
            coaching_note = (
                "Optimal training state. Balanced recovery across upper and lower kinematic chains."
            )

        return {
            'username': user.username,
            'is_premium': getattr(user, 'isPremiumUser', False),
            'overall_readiness_score': overall_readiness,
            'total_volume_7d_kg': round(total_volume_overall, 1),
            'assessment_date': str(today),
            'coaching_note': coaching_note,
            'muscles': muscles,
        }
