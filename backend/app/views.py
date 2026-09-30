import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import (
    AuthService,
    DietService,
    PaymentService,
    ProfileService,
    ExerciseService,
    WorkoutService,
    AnalyticsService,
    ProgramService,
    RecoveryService,
)

from .serializers import (
    ExerciseSerializer,
    WorkoutLogSerializer,
    DietPlanHistorySerializer,
)


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order_data = PaymentService.create_order(request.user, amount)
            return Response(order_data, status=status.HTTP_200_OK)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create Razorpay order: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            return Response(
                {'error': 'Missing payment verification parameters'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            PaymentService.verify_payment_and_grant_premium(
                user=request.user,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
                razorpay_signature=razorpay_signature,
            )
            return Response({
                'verified': True,
                'message': 'Payment verified and premium access granted.',
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'verified': False, 'error': f'Payment verification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


@csrf_exempt
def signup_view(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body'}, status=400)

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    success, message, auth_data = AuthService.register_user(
        request=request,
        username=username,
        email=email,
        password=password,
    )

    if success:
        return JsonResponse({
            'status': 'success',
            'message': message,
            **auth_data,
        }, status=200)
    else:
        return JsonResponse({'status': 'error', 'message': message}, status=400)


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON body'}, status=400)

    username = data.get('username')
    password = data.get('password')

    success, message, auth_data = AuthService.authenticate_user(
        request=request,
        username=username,
        password=password,
    )

    if success:
        return JsonResponse({
            'status': 'success',
            'message': message,
            **auth_data,
        }, status=200)
    else:
        return JsonResponse({'status': 'error', 'message': message}, status=401)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_list_create(request):
    if request.method == 'GET':
        profiles = ProfileService.get_user_profiles(request.user)
        return Response(profiles, status=status.HTTP_200_OK)

    if request.method == 'POST':
        success, result = ProfileService.save_user_profile(request.user, request.data)
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_fetch(request):
    profiles = ProfileService.get_user_profiles(request.user)
    return Response(profiles, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict(request):
    try:
        data = request.data
        if not data:
            return Response({'error': 'No input data provided'}, status=status.HTTP_400_BAD_REQUEST)

        BMI = float(data['BMI'])
        BMR = float(data['BMR'])
        Total_Calories = float(data['Total_Calories'])
        veg_only = bool(data.get('veg_only', False))
        goal = data.get('goal') or data.get('goal_type') or data.get('weight_goal')

        recommendation = DietService.calculate_diet_plan(
            bmi=BMI,
            bmr=BMR,
            total_calories=Total_Calories,
            veg_only=veg_only,
            goal=goal,
        )
        return Response(recommendation, status=status.HTTP_200_OK)

    except KeyError as e:
        return Response({'error': f'Missing required field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError) as e:
        return Response({'error': f'Invalid numeric data: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExerciseListView(APIView):
    """
    Public or authenticated exercise catalog filtered by body_part parameter.
    """
    def get(self, request):
        body_part = request.query_params.get('body_part')
        if body_part:
            exercises = ExerciseService.get_exercises_by_body_part(body_part)
        else:
            exercises = ExerciseService.get_all_exercises()
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@csrf_exempt
def payment_webhook(request):
    """
    Razorpay server-to-server webhook endpoint.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    signature = request.headers.get('X-Razorpay-Signature', '')
    success, message = PaymentService.handle_webhook(request.body, signature)
    if success:
        return JsonResponse({'status': 'ok', 'message': message}, status=200)
    return JsonResponse({'status': 'error', 'message': message}, status=400)


class WorkoutListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workouts = WorkoutService.get_user_workouts(request.user)
        serializer = WorkoutLogSerializer(workouts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = WorkoutService.log_workout(request.user, request.data)
        return Response(data, status=status.HTTP_201_CREATED)


class WorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        success, message = WorkoutService.delete_workout(request.user, pk)
        if success:
            return Response({'message': message}, status=status.HTTP_200_OK)
        return Response({'error': message}, status=status.HTTP_404_NOT_FOUND)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = AnalyticsService.get_user_dashboard_stats(request.user)
        return Response(stats, status=status.HTTP_200_OK)


class SaveDietPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = AnalyticsService.get_user_diet_plans(request.user)
        serializer = DietPlanHistorySerializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = AnalyticsService.save_diet_plan(request.user, request.data)
        return Response(data, status=status.HTTP_201_CREATED)


class ProgramListView(APIView):
    def get(self, request):
        programs = ProgramService.get_all_programs(request.user)
        return Response(programs, status=status.HTTP_200_OK)


class ProgramDetailView(APIView):
    def get(self, request, slug):
        program_data = ProgramService.get_program_detail(slug, request.user)
        return Response(program_data, status=status.HTTP_200_OK)


class ProgramEnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        success, result = ProgramService.enroll_user(request.user, slug)
        if success:
            return Response(result, status=status.HTTP_200_OK)
        return Response({'error': result}, status=status.HTTP_403_FORBIDDEN)


class ActiveProgramView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollment = ProgramService.get_active_enrollment(request.user)
        return Response(enrollment, status=status.HTTP_200_OK)


class ProgramCompleteDayView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        day_id = request.data.get('day_id')
        if not day_id:
            return Response({'error': 'day_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        log_workout = bool(request.data.get('log_workout', False))
        workout_data = request.data.get('workout_data')

        success, result = ProgramService.complete_day(
            user=request.user,
            day_id=int(day_id),
            log_workout=log_workout,
            workout_data=workout_data
        )
        if success:
            return Response(result, status=status.HTTP_200_OK)
        return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)


class AthleteHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = RecoveryService.get_athlete_heatmap_data(request.user)
        return Response(data, status=status.HTTP_200_OK)