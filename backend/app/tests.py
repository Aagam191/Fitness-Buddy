import json
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .ml_utils import get_diet_model
from .models import User_details

User = get_user_model()


class MyFitAuthAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.username = "testuser"
        self.email = "testuser@example.com"
        self.password = "Secret123!"
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
            isPremiumUser=False,
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

    def test_registration_success(self):
        url = reverse('register')
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "Password123!",
            "isPremiumUser": True,  # Should be forced to False by backend
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)

        created_user = User.objects.get(username="newuser")
        self.assertFalse(created_user.isPremiumUser)  # Confirms premium spoofing prevention

    def test_registration_duplicate_username(self):
        url = reverse('register')
        payload = {
            "username": self.username,
            "email": "another@example.com",
            "password": "Password123!",
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data['status'], 'error')
        self.assertIn('already taken', data['message'])

    def test_login_success(self):
        url = reverse('login')
        payload = {
            "username": self.username,
            "password": self.password,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertEqual(data['username'], self.username)

    def test_login_invalid_credentials(self):
        url = reverse('login')
        payload = {
            "username": self.username,
            "password": "WrongPassword",
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 401)

    def test_token_refresh(self):
        url = reverse('token_refresh')
        payload = {
            "refresh": str(self.refresh),
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_predict_unauthenticated_rejected(self):
        url = reverse('predict')
        payload = {
            "BMI": 22.5,
            "BMR": 1600,
            "Total_Calories": 2200,
            "veg_only": False,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_predict_authenticated_success(self):
        url = reverse('predict')
        payload = {
            "BMI": 23.0,
            "BMR": 1650,
            "Total_Calories": 2100,
            "veg_only": True,
        }
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Breakfast 1', response.data)
        self.assertIn('Lunch 1', response.data)
        self.assertIn('Dinner 1', response.data)
        self.assertEqual(response.data['Food Type'], 'Veg')

    def test_predict_macro_vector_space_and_veg_purity(self):
        url = reverse('predict')
        payload = {
            "BMI": 25.0,
            "BMR": 1700,
            "Total_Calories": 2200,
            "veg_only": True,
            "goal": "Muscle Gain",
        }
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify Phase 1 Macronutrient Vector Space metadata
        self.assertIn('macros', response.data)
        self.assertIn('target_macros', response.data)
        self.assertIn('meal_details', response.data)
        self.assertEqual(response.data['goal'], 'Muscle Gain')
        self.assertGreater(response.data['macros']['protein_g'], 60)
        self.assertGreater(response.data['macros']['calories'], 1800)

        # Verify 100% pure vegetarian enforcement
        for slot, details in response.data['meal_details'].items():
            self.assertTrue(details['is_veg'], f"Meal {slot} ({details['name']}) is not vegetarian!")
            self.assertGreater(details['calories'], 0)

    def test_user_details_unauthenticated_rejected(self):
        url = reverse('user-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_details_authenticated_flow(self):
        url = reverse('user-list-create')
        payload = {
            "height": 175,
            "weight": 70,
            "age": 25,
            "gender": "Male",
            "bmi": 22.86,
            "bmr": 1680.50,
            "food_type": "Veg",
        }
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        post_response = self.client.post(url, payload, format='json')
        self.assertEqual(post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(post_response.data['username'], self.username)

        # Verify record in database has foreign key and username bound
        record = User_details.objects.get(user=self.user)
        self.assertEqual(record.height, 175)
        self.assertEqual(record.username, self.username)

        # Test fetch
        fetch_url = reverse('user-fetch')
        fetch_response = self.client.get(fetch_url)
        self.assertEqual(fetch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fetch_response.data), 1)
        self.assertEqual(fetch_response.data[0]['food_type'], "Veg")

    def test_create_order_unauthenticated_rejected(self):
        url = reverse('create_order')
        response = self.client.post(url, {"amount": 2000}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_authenticated_success(self):
        url = reverse('create_order')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        with patch('app.services.payment_service.razorpay_client.order.create', return_value={'id': 'order_rzp_mock123', 'amount': 200000, 'currency': 'INR'}):
            response = self.client.post(url, {"amount": 2000}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['order_id'], 'order_rzp_mock123')
            self.assertEqual(response.data['amount'], 200000)
            self.assertEqual(response.data['currency'], 'INR')

    def test_verify_payment_unauthenticated_rejected(self):
        url = reverse('verify_payment')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('razorpay.Client')
    def test_verify_payment_authenticated_updates_authenticated_user_only(self, mock_razorpay):
        # Create second user to verify spoofing does not affect other users
        victim_user = User.objects.create_user(
            username="victim",
            email="victim@example.com",
            password="Password123!",
            isPremiumUser=False,
        )

        url = reverse('verify_payment')
        payload = {
            "razorpay_payment_id": "pay_test123",
            "razorpay_order_id": "order_test123",
            "razorpay_signature": "sig_valid_test",
            "username": "victim",  # Spoofed username in body
        }

        # Mock razorpay client utility verification in payment_service
        with patch('app.services.payment_service.razorpay_client.utility.verify_payment_signature', return_value=True):
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
            response = self.client.post(url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['verified'])

        # Reload users from DB
        self.user.refresh_from_db()
        victim_user.refresh_from_db()

        # The authenticated caller is upgraded, NOT the spoofed username
        self.assertTrue(self.user.isPremiumUser)
        self.assertFalse(victim_user.isPremiumUser)

    def test_cached_model_singleton_identity(self):
        model1 = get_diet_model()
        model2 = get_diet_model()
        self.assertIs(model1, model2)

    def test_exercises_list_and_filter(self):
        from .models import Exercise
        Exercise.objects.create(
            name="Test Crunch",
            body_part="abs",
            instructions=["Step 1", "Step 2"],
        )
        Exercise.objects.create(
            name="Test Curl",
            body_part="biceps",
            instructions=["Step 1"],
        )

        url = reverse('exercise-list')
        # All exercises
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

        # Filtered by body_part
        filter_response = self.client.get(f"{url}?body_part=abs")
        self.assertEqual(filter_response.status_code, status.HTTP_200_OK)
        for item in filter_response.data:
            self.assertEqual(item['body_part'].lower(), 'abs')

    def test_payment_webhook_fulfillment(self):
        import hmac
        import hashlib
        from django.conf import settings
        from .models import PaymentTransaction

        # Create an initial pending transaction
        txn = PaymentTransaction.objects.create(
            user=self.user,
            order_id="order_webhook_123",
            amount=2000,
            status="CREATED",
        )

        payload_dict = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook_456",
                        "order_id": "order_webhook_123",
                        "amount": 200000,
                    }
                }
            }
        }
        raw_body = json.dumps(payload_dict).encode('utf-8')
        secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '')
        signature = hmac.new(secret.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()

        url = reverse('payment-webhook')
        response = self.client.post(
            url,
            data=raw_body,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE=signature,
        )
        self.assertEqual(response.status_code, 200)

        # Confirm user is upgraded to premium and txn status is PAID
        self.user.refresh_from_db()
        txn.refresh_from_db()
        self.assertTrue(self.user.isPremiumUser)
        self.assertEqual(txn.status, "PAID")
        self.assertEqual(txn.payment_id, "pay_webhook_456")

    def test_workout_log_create_list_and_delete(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('workout-list-create')
        payload = {
            "title": "Leg Day Routine",
            "duration_minutes": 50,
            "notes": "Felt strong on squats",
            "sets": [
                {"exercise_name": "Squats", "set_number": 1, "reps": 12, "weight_kg": 60.0},
                {"exercise_name": "Squats", "set_number": 2, "reps": 10, "weight_kg": 70.0},
            ]
        }

        # Create workout
        post_response = self.client.post(url, payload, format='json')
        self.assertEqual(post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(post_response.data['title'], "Leg Day Routine")
        self.assertEqual(len(post_response.data['sets']), 2)
        workout_id = post_response.data['id']

        # List workouts
        get_response = self.client.get(url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(get_response.data), 1)

        # Delete workout
        delete_url = reverse('workout-detail', kwargs={'pk': workout_id})
        del_response = self.client.delete(delete_url)
        self.assertEqual(del_response.status_code, status.HTTP_200_OK)

        # Confirm deleted
        get_after_del = self.client.get(url)
        self.assertEqual(len(get_after_del.data), 0)

    def test_dashboard_and_diet_history(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        # Save a diet plan history
        diet_url = reverse('diet-history')
        diet_payload = {
            "bmi": 22.5,
            "bmr": 1600.0,
            "total_calories": 2150.0,
            "plan_data": {"breakfast": "Oatmeal", "lunch": "Salad"},
        }
        post_diet = self.client.post(diet_url, diet_payload, format='json')
        self.assertEqual(post_diet.status_code, status.HTTP_201_CREATED)

        # Fetch dashboard
        dash_url = reverse('user-dashboard')
        dash_response = self.client.get(dash_url)
        self.assertEqual(dash_response.status_code, status.HTTP_200_OK)
        data = dash_response.data
        self.assertEqual(data['username'], self.username)
        self.assertIn('workout_summary', data)
        self.assertIn('latest_diet_plan', data)
        self.assertIsNotNone(data['latest_diet_plan'])
        self.assertEqual(float(data['latest_diet_plan']['bmi']), 22.5)

    def test_program_list_and_details_access_control(self):
        from .models import TrainingProgram, ProgramWeek, ProgramDay, ProgramExercise
        # Create a test premium program
        prog = TrainingProgram.objects.create(
            slug='test-hypertrophy',
            title='Test 8-Week Hypertrophy',
            description='Test program description',
            goal='Hypertrophy',
            difficulty='INTERMEDIATE',
            days_per_week=4,
            duration_weeks=8,
            is_premium=True,
        )
        week1 = ProgramWeek.objects.create(program=prog, week_number=1, phase_title='Adaptation')
        week2 = ProgramWeek.objects.create(program=prog, week_number=2, phase_title='Overload')
        day1 = ProgramDay.objects.create(program_week=week1, day_number=1, title='Push Day')
        day2 = ProgramDay.objects.create(program_week=week2, day_number=1, title='Heavy Bench')
        ProgramExercise.objects.create(program_day=day1, exercise_name='Bench Press', target_sets=3, target_reps='10')
        ProgramExercise.objects.create(program_day=day2, exercise_name='Incline Bench', target_sets=4, target_reps='8')

        # Test unauthenticated / non-premium detail view
        url = reverse('program-detail', kwargs={'slug': 'test-hypertrophy'})
        res_non_prem = self.client.get(url)
        self.assertEqual(res_non_prem.status_code, status.HTTP_200_OK)
        weeks_data = res_non_prem.data['weeks']
        self.assertFalse(weeks_data[0]['is_locked'])  # Week 1 is open preview
        self.assertTrue(weeks_data[1]['is_locked'])   # Week 2 is locked
        self.assertEqual(len(weeks_data[1]['days'][0]['exercises']), 0)  # Exercises masked

        # Test premium user detail view
        self.user.isPremiumUser = True
        self.user.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        res_prem = self.client.get(url)
        self.assertEqual(res_prem.status_code, status.HTTP_200_OK)
        self.assertFalse(res_prem.data['weeks'][1]['is_locked'])
        self.assertEqual(len(res_prem.data['weeks'][1]['days'][0]['exercises']), 1)

    def test_program_enrollment_and_progression(self):
        from .models import TrainingProgram, ProgramWeek, ProgramDay
        prog = TrainingProgram.objects.create(
            slug='test-power',
            title='Test Power',
            description='Strength program',
            goal='Strength',
            is_premium=True,
        )
        week1 = ProgramWeek.objects.create(program=prog, week_number=1, phase_title='Phase 1')
        day1 = ProgramDay.objects.create(program_week=week1, day_number=1, title='Squat Day')

        # Non-premium enrollment attempt should fail
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        enroll_url = reverse('program-enroll', kwargs={'slug': 'test-power'})
        fail_res = self.client.post(enroll_url)
        self.assertEqual(fail_res.status_code, status.HTTP_403_FORBIDDEN)

        # Upgrade user to premium and enroll
        self.user.isPremiumUser = True
        self.user.save()
        success_res = self.client.post(enroll_url)
        self.assertEqual(success_res.status_code, status.HTTP_200_OK)

        # Check active program view
        active_url = reverse('program-active')
        active_res = self.client.get(active_url)
        self.assertEqual(active_res.status_code, status.HTTP_200_OK)
        self.assertEqual(active_res.data['program']['slug'], 'test-power')
        self.assertEqual(active_res.data['current_week'], 1)
        self.assertEqual(active_res.data['current_day'], 1)

        # Complete day 1
        comp_url = reverse('program-complete-day')
        comp_res = self.client.post(comp_url, {'day_id': day1.id}, format='json')
        self.assertEqual(comp_res.status_code, status.HTTP_200_OK)
        self.assertEqual(comp_res.data['completed_days_count'], 1)

    def test_athlete_heatmap_calculation(self):
        from .models import WorkoutLog, WorkoutSet
        from django.utils import timezone

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Log a workout with Bench Press (targets chest, triceps, shoulders)
        log = WorkoutLog.objects.create(
            user=self.user,
            title='Push Day Test',
            date=timezone.localdate(),
            duration_minutes=50,
        )
        WorkoutSet.objects.create(workout_log=log, exercise_name='Barbell Bench Press', set_number=1, reps=10, weight_kg=80.0)
        WorkoutSet.objects.create(workout_log=log, exercise_name='Barbell Bench Press', set_number=2, reps=10, weight_kg=80.0)

        # Fetch heatmap
        heatmap_url = reverse('athlete-heatmap')
        response = self.client.get(heatmap_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('muscles', data)
        self.assertIn('overall_readiness_score', data)
        self.assertIn('total_volume_7d_kg', data)
        self.assertGreater(data['total_volume_7d_kg'], 0)

        chest_data = data['muscles']['chest']
        self.assertEqual(chest_data['sets_7d'], 2)
        self.assertEqual(chest_data['volume_7d_kg'], 1600.0)
        self.assertIn(chest_data['status'], ['FATIGUED', 'RECOVERING'])


