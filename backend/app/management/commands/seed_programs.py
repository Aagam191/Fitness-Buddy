from django.core.management.base import BaseCommand
from django.db import transaction
from app.models import TrainingProgram, ProgramWeek, ProgramDay, ProgramExercise, Exercise

class Command(BaseCommand):
    help = 'Seeds curated 8-week training programs efficiently using bulk operations'

    def handle(self, *args, **options):
        self.stdout.write("Starting high-performance curated 8-week training programs seeding...")

        # Cache exercises in memory to avoid N+1 queries
        exercise_cache = {}
        for ex in Exercise.objects.all():
            exercise_cache[ex.name.lower()] = ex

        def find_exercise(name):
            name_lower = name.lower()
            if name_lower in exercise_cache:
                return exercise_cache[name_lower]
            for key, obj in exercise_cache.items():
                if name_lower.split()[0] in key:
                    return obj
            return None

        with transaction.atomic():
            # 1. Hypertrophy Surge (PPL Split - 6 Days/Week)
            p1, _ = TrainingProgram.objects.update_or_create(
                slug='hypertrophy-surge',
                defaults={
                    'title': '8-Week Hypertrophy Surge',
                    'subtitle': 'Elite Push/Pull/Legs 6-Day Periodized Muscle Building Protocol',
                    'description': 'Engineered for lifters seeking maximal muscle hypertrophy, structural balance, and aesthetic symmetry. Combines undulating volume waves with progressive overload across compound and isolation vectors.',
                    'goal': 'Muscle Hypertrophy',
                    'difficulty': 'INTERMEDIATE',
                    'days_per_week': 6,
                    'duration_weeks': 8,
                    'is_premium': True,
                    'banner_gradient': 'linear-gradient(135deg, #2a0808 0%, #111111 60%, #000000 100%)',
                }
            )
            self._seed_program_bulk(p1, self._get_ppl_template(), find_exercise)

            # 2. Athletic Strength & Power (Upper/Lower Split - 4 Days/Week)
            p2, _ = TrainingProgram.objects.update_or_create(
                slug='athletic-strength-power',
                defaults={
                    'title': '8-Week Athletic Strength & Power',
                    'subtitle': 'Upper/Lower Split for Maximum Force Output & Functional Power',
                    'description': 'Built for athletes who want elite strength on compound lifts while cultivating explosive power and injury resilience. Utilizes wave loading, rate of force development drills, and posterior chain reinforcement.',
                    'goal': 'Strength & Power',
                    'difficulty': 'ADVANCED',
                    'days_per_week': 4,
                    'duration_weeks': 8,
                    'is_premium': True,
                    'banner_gradient': 'linear-gradient(135deg, #1a1a2e 0%, #111111 60%, #000000 100%)',
                }
            )
            self._seed_program_bulk(p2, self._get_upper_lower_template(), find_exercise)

            # 3. Dumbbell Metabolic Shred (Full Body - 3 Days/Week)
            p3, _ = TrainingProgram.objects.update_or_create(
                slug='metabolic-shred',
                defaults={
                    'title': '8-Week Metabolic Shred',
                    'subtitle': 'High-Density Full Body Conditioning & Lean Muscle Retention',
                    'description': 'Designed for athletes focused on aggressive fat loss, metabolic conditioning, and lean tissue preservation with minimal gym equipment. Features high-density tri-sets, controlled rest intervals, and core stabilization.',
                    'goal': 'Fat Loss & Conditioning',
                    'difficulty': 'BEGINNER',
                    'days_per_week': 3,
                    'duration_weeks': 8,
                    'is_premium': True,
                    'banner_gradient': 'linear-gradient(135deg, #1f1404 0%, #111111 60%, #000000 100%)',
                }
            )
            self._seed_program_bulk(p3, self._get_metabolic_template(), find_exercise)

        self.stdout.write(self.style.SUCCESS("All 3 curated 8-week training programs seeded successfully!"))

    def _seed_program_bulk(self, program, template_data, find_exercise):
        # Clear existing weeks to ensure a clean idempotent state
        ProgramWeek.objects.filter(program=program).delete()

        phases, days_template = template_data

        # 1. Bulk create weeks
        week_objs = []
        for start_w, end_w, phase_title, focus, rpe_str, def_sets, def_reps in phases:
            for w_num in range(start_w, end_w + 1):
                week_objs.append(ProgramWeek(
                    program=program,
                    week_number=w_num,
                    phase_title=f"Week {w_num}: {phase_title.split(': ')[1]}",
                    focus_summary=focus,
                    target_rpe=rpe_str,
                ))
        created_weeks = ProgramWeek.objects.bulk_create(week_objs)

        # 2. Bulk create days
        day_objs = []
        day_metadata = [] # stores (created_day_idx, exercise_list, target_rpe)
        for week_idx, week in enumerate(created_weeks):
            w_num = week.week_number
            # Determine RPE profile for this week
            target_rpe = 7.5 if w_num in [1, 2] else (8.5 if w_num in [3, 4, 5] else (9.5 if w_num in [6, 7] else 6.0))
            def_sets = 3 if w_num in [1, 2] else (4 if w_num in [3, 4, 5, 6, 7] else 2)
            def_reps = "10-12" if w_num in [1, 2, 8] else ("8-10" if w_num in [3, 4, 5] else "6-8")

            for day_idx, (d_title, is_rest, dur, exercises) in enumerate(days_template, start=1):
                day = ProgramDay(
                    program_week=week,
                    day_number=day_idx,
                    title=d_title,
                    is_rest_day=is_rest,
                    estimated_duration_min=dur,
                    warmup_notes="Dynamic mobility & joint activation" if not is_rest else "Active walk & hydration",
                )
                day_objs.append(day)
                day_metadata.append((exercises, def_sets, def_reps, target_rpe))

        created_days = ProgramDay.objects.bulk_create(day_objs)

        # 3. Bulk create exercises
        exercise_objs = []
        for day, (exercises, def_sets, def_reps, target_rpe) in zip(created_days, day_metadata):
            if day.is_rest_day:
                continue
            for order_idx, (ex_name, cue, rest) in enumerate(exercises, start=1):
                ex_obj = find_exercise(ex_name)
                exercise_objs.append(ProgramExercise(
                    program_day=day,
                    exercise=ex_obj,
                    exercise_name=ex_name,
                    order=order_idx,
                    target_sets=def_sets,
                    target_reps=def_reps,
                    rest_seconds=rest,
                    target_rpe=target_rpe,
                    coaching_cue=cue,
                ))

        ProgramExercise.objects.bulk_create(exercise_objs)

    def _get_ppl_template(self):
        phases = [
            (1, 2, "Phase 1: Musculoskeletal Adaptation", "Establish baseline movement competency and prime tendon tolerance.", "RPE 7.0 - 7.5", 3, "10-12"),
            (3, 5, "Phase 2: Progressive Volume Overload", "Escalate total volume load and recruit maximum high-threshold motor units.", "RPE 8.0 - 8.5", 4, "8-10"),
            (6, 7, "Phase 3: Peak Mechanical Tension", "Heavy top sets with high mechanical tension for myofibrillar hypertrophy.", "RPE 9.0 - 9.5", 4, "6-8"),
            (8, 8, "Phase 4: Deload & Supercompensation", "Reduce volume by 50% to clear systemic fatigue and solidify adaptations.", "RPE 6.0 - 6.5", 2, "10-12"),
        ]

        days = [
            ("Push A (Chest & Triceps)", False, 55, [
                ("Barbell Bench Press", "Maintain scapular retraction, pause 1s on chest", 90),
                ("Incline Dumbbell Press", "Drive through upper chest, 30 degree incline", 75),
                ("Overhead Shoulder Press", "Brace core tight, do not arch lower back", 90),
                ("Dumbbell Lateral Raise", "Lead with elbows, slight forward lean", 60),
                ("Triceps Rope Pushdown", "Flare rope at full lockout, 2s eccentric", 60),
            ]),
            ("Pull A (Back & Biceps)", False, 55, [
                ("Barbell Bent Over Row", "Hinge at hips, pull bar to lower ribcage", 90),
                ("Lat Pulldown", "Drive elbows straight down towards back pockets", 75),
                ("Barbell Curl", "Keep elbows pinned to sides, control lowering", 60),
                ("Dumbbell Hammer Curl", "Neutral grip, squeeze brachialis at top", 60),
            ]),
            ("Legs A (Quads & Calves)", False, 60, [
                ("Barbell Back Squat", "Hit parallel depth, push knees out over toes", 120),
                ("Leg Press", "Feet shoulder width, do not lock knees at top", 90),
                ("Leg Extensions", "Full knee extension with 1s squeeze", 60),
                ("Standing Calf Raises", "Full stretch at bottom, rise onto big toes", 45),
                ("Crunches", "Contract rectus abdominis without pulling neck", 45),
            ]),
            ("Push B (Shoulders & Chest)", False, 55, [
                ("Incline Dumbbell Press", "Focus on upper chest contraction", 90),
                ("Barbell Bench Press", "Moderate grip, steady controlled tempo", 90),
                ("Dumbbell Lateral Raise", "Constant tension throughout movement", 60),
                ("Incline Skull Crushers", "Lower dumbbells behind head for full tricep stretch", 60),
                ("Russian Dumbell Twist", "Controlled rotational twist, heel off floor", 45),
            ]),
            ("Pull B (Lats & Posterior Chain)", False, 55, [
                ("Pull-ups", "Full range of motion from dead hang to chin over bar", 90),
                ("Barbell Bent Over Row", "Explode up, 3-second lowering tempo", 90),
                ("Barbell Curl", "Strict form, zero torso swinging", 60),
                ("Dumbbell Spider Curl", "Chest supported on incline bench for strict isolation", 60),
            ]),
            ("Legs B (Hamstrings & Glutes)", False, 60, [
                ("Romanian Deadlift", "Hinge hips back, feel intense hamstring stretch", 120),
                ("Leg Press", "High foot placement to emphasize glutes and hamstrings", 90),
                ("Standing Calf Raises", "Pause 2s in stretched bottom position", 60),
                ("Crunches", "Slow 3s eccentric cadence", 45),
            ]),
            ("Rest & Active Recovery", True, 20, []),
        ]
        return phases, days

    def _get_upper_lower_template(self):
        phases = [
            (1, 2, "Phase 1: Neural Priming", "Establish barbell bar paths and baseline power output.", "RPE 7.0 - 7.5", 3, "6-8"),
            (3, 5, "Phase 2: Heavy Load Wave", "Progressive overload on main compound lifts (Squat, Bench, Row, Deadlift).", "RPE 8.0 - 8.5", 4, "5-6"),
            (6, 7, "Phase 3: Max Force Output", "Intense compound work targeting neuromuscular recruitment.", "RPE 9.0 - 9.5", 4, "3-5"),
            (8, 8, "Phase 4: Deload & Benchmark", "Submaximal technique drills and CNS recovery.", "RPE 6.0 - 6.5", 2, "8-10"),
        ]

        days = [
            ("Upper Strength Focus", False, 60, [
                ("Barbell Bench Press", "Heavy compound pattern. Tuck elbows 45 degrees.", 120),
                ("Barbell Bent Over Row", "Drive elbows high, hold contraction 1 second.", 90),
                ("Overhead Shoulder Press", "Strict overhead press with locked glutes.", 90),
                ("Barbell Curl", "Strict curl cadence.", 60),
            ]),
            ("Lower Strength Focus", False, 65, [
                ("Barbell Back Squat", "Hit depth with upright torso, drive through midfoot.", 150),
                ("Romanian Deadlift", "Hips high and back, keep bar tight to shins.", 120),
                ("Standing Calf Raises", "Heavy standing calf raises with pause.", 60),
                ("Crunches", "Contract lower abs without swinging legs.", 45),
            ]),
            ("Rest & Active Mobility", True, 20, []),
            ("Upper Hypertrophy & Power", False, 55, [
                ("Incline Dumbbell Press", "Explosive concentric drive, 3-second negative.", 90),
                ("Pull-ups", "Weighted or bodyweight pullups with strict form.", 90),
                ("Dumbbell Lateral Raise", "Side deltoid isolation.", 60),
                ("Dumbbell Hammer Curl", "Cross-body or standard hammer curl.", 60),
            ]),
            ("Lower Speed & Power", False, 60, [
                ("Leg Press", "Explosive drive off footplate.", 90),
                ("Leg Extensions", "High rep finisher for quad vascularity.", 60),
                ("Standing Calf Raises", "Controlled tempo calf raises.", 45),
                ("Russian Dumbell Twist", "Rotational core engagement.", 45),
            ]),
            ("Active Recovery Day", True, 20, []),
            ("Rest & Restoration", True, 20, []),
        ]
        return phases, days

    def _get_metabolic_template(self):
        phases = [
            (1, 4, "Phase 1: High-Density Metabolic Conditioning", "Short rest intervals, elevated heart rate, continuous muscular tension.", "RPE 7.5 - 8.0", 3, "12-15"),
            (5, 8, "Phase 2: Lean Definition & Glycogen Depletion", "Tri-sets and density intervals for maximum caloric expenditure.", "RPE 8.5 - 9.0", 4, "10-12"),
        ]

        days = [
            ("Full Body Metabolic Circuit A", False, 45, [
                ("Incline Dumbbell Press", "Continuous tempo, 45-second rest intervals", 45),
                ("Barbell Bent Over Row", "Strict back squeeze, minimal rest", 45),
                ("Barbell Back Squat", "High rep goblet or barbell squat cadence", 60),
                ("Russian Dumbell Twist", "Elevate feet for metabolic core burnout", 30),
            ]),
            ("Rest & Low Intensity Cardio", True, 30, []),
            ("Full Body Density Circuit B", False, 45, [
                ("Overhead Shoulder Press", "Dumbbell clean and press tempo", 45),
                ("Romanian Deadlift", "Posterior chain tension with explosive hip extension", 60),
                ("Dumbbell Hammer Curl", "Controlled hammer curls with forearm burn", 45),
            ]),
            ("Rest & Active Walk", True, 30, []),
            ("Full Body Explosive Circuit C", False, 45, [
                ("Barbell Bench Press", "Dynamic speed reps", 60),
                ("Pull-ups", "Bodyweight or assisted pull-ups", 60),
                ("Leg Extensions", "Quadriceps metabolic burnout", 45),
                ("Standing Calf Raises", "High-frequency calf pulses", 30),
            ]),
            ("Rest & Regeneration", True, 20, []),
            ("Rest Day", True, 20, []),
        ]
        return phases, days
