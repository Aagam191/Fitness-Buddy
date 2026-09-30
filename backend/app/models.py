from django.contrib.auth.models import AbstractUser, UserManager as DefaultUserManager, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    isPremiumUser = models.BooleanField(default=False)

    objects = UserManager()

    def __str__(self):
        return self.username

from django.conf import settings

class User_details(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='details'
    )
    username = models.CharField(max_length=255)
    height = models.IntegerField()
    weight = models.IntegerField()
    age = models.IntegerField()
    gender = models.CharField(max_length=255)
    bmi = models.DecimalField(decimal_places=2, max_digits=1000)
    bmr = models.DecimalField(decimal_places=2, max_digits=1000)
    food_type = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.username} ({self.age}y, {self.weight}kg)"


class Exercise(models.Model):
    name = models.CharField(max_length=200)
    body_part = models.CharField(max_length=50, db_index=True)
    video_front = models.CharField(max_length=500, blank=True, default='')
    video_side = models.CharField(max_length=500, blank=True, default='')
    instructions = models.JSONField(default=list, blank=True)
    difficulty = models.CharField(max_length=50, default='Intermediate')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['body_part', 'name']

    def __str__(self):
        return f"{self.name} ({self.body_part})"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ('CREATED', 'Created'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_transactions',
    )
    order_id = models.CharField(max_length=100, db_index=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    signature = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_id} - {self.user.username} - {self.status}"


class WorkoutLog(models.Model):
    from django.utils import timezone
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts',
    )
    title = models.CharField(max_length=200)
    date = models.DateField(default=timezone.localdate)
    duration_minutes = models.IntegerField(default=45)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} on {self.date} by {self.user.username}"


class WorkoutSet(models.Model):
    workout_log = models.ForeignKey(
        WorkoutLog,
        on_delete=models.CASCADE,
        related_name='sets',
    )
    exercise_name = models.CharField(max_length=200)
    set_number = models.IntegerField(default=1)
    reps = models.IntegerField(default=10)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)

    class Meta:
        ordering = ['set_number']

    def __str__(self):
        return f"Set {self.set_number}: {self.exercise_name} - {self.reps} reps @ {self.weight_kg}kg"


class DietPlanHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diet_plans',
    )
    bmi = models.DecimalField(max_digits=6, decimal_places=2)
    bmr = models.DecimalField(max_digits=6, decimal_places=2)
    total_calories = models.DecimalField(max_digits=7, decimal_places=2)
    plan_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Diet Plan for {self.user.username} on {self.created_at.strftime('%Y-%m-%d')}"


class TrainingProgram(models.Model):
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]

    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    goal = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    days_per_week = models.IntegerField(default=4)
    duration_weeks = models.IntegerField(default=8)
    is_premium = models.BooleanField(default=True)
    banner_gradient = models.CharField(max_length=150, default='linear-gradient(135deg, #1f1f1f, #0a0a0a)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.duration_weeks} Weeks)"


class ProgramWeek(models.Model):
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='weeks')
    week_number = models.IntegerField()
    phase_title = models.CharField(max_length=150)
    focus_summary = models.TextField(blank=True)
    target_rpe = models.CharField(max_length=50, default='RPE 7-8')

    class Meta:
        ordering = ['program', 'week_number']
        unique_together = ('program', 'week_number')

    def __str__(self):
        return f"{self.program.title} - Week {self.week_number}"


class ProgramDay(models.Model):
    program_week = models.ForeignKey(ProgramWeek, on_delete=models.CASCADE, related_name='days')
    day_number = models.IntegerField()
    title = models.CharField(max_length=150)
    is_rest_day = models.BooleanField(default=False)
    estimated_duration_min = models.IntegerField(default=45)
    warmup_notes = models.TextField(blank=True, default="5-10 min dynamic mobility & joint activation")

    class Meta:
        ordering = ['program_week', 'day_number']
        unique_together = ('program_week', 'day_number')

    def __str__(self):
        return f"W{self.program_week.week_number}D{self.day_number}: {self.title}"


class ProgramExercise(models.Model):
    program_day = models.ForeignKey(ProgramDay, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.SET_NULL, null=True, blank=True)
    exercise_name = models.CharField(max_length=200)
    order = models.IntegerField(default=1)
    target_sets = models.IntegerField(default=3)
    target_reps = models.CharField(max_length=50, default="8-10")
    rest_seconds = models.IntegerField(default=90)
    target_rpe = models.DecimalField(max_digits=3, decimal_places=1, default=8.0)
    coaching_cue = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['program_day', 'order']

    def __str__(self):
        return f"{self.exercise_name} ({self.target_sets} sets x {self.target_reps})"


class UserProgramEnrollment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE)
    started_at = models.DateField(default=timezone.localdate)
    is_active = models.BooleanField(default=True)
    completed_days = models.JSONField(default=list)
    current_week = models.IntegerField(default=1)
    current_day = models.IntegerField(default=1)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} enrolled in {self.program.title} (Active: {self.is_active})"



