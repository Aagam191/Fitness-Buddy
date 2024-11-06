from django.shortcuts import render

# Create your views here.
from .ml_utils import DietRecommendationModel
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import razorpay
import json
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))

class CreateOrderView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        currency = 'INR'
        
        # Create Razorpay Order
        razorpay_order = razorpay_client.order.create(dict(
            amount=int(float(amount) * 100),  # Razorpay amount is in paisa
            currency=currency,
            payment_capture='0'
        ))
        
        order_id = razorpay_order['id']
        
        return Response({
            'order_id': order_id,
            'amount': amount,
            'currency': currency,
            'key': settings.RAZORPAY_KEY_ID
        })

class VerifyPaymentView(APIView):
    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        username = request.data.get('username')
        # Verify signature
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except:
            return Response({'verified': False}, status=status.HTTP_400_BAD_REQUEST)
        
        
        try:
            user = get_object_or_404(User, username=username)
            user.isPremiumUser = True
            user.save()
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to update user status: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # If we reach here, payment is successful
        # Update your database, send confirmation email, etc.
        
        return Response({'verified': True})
    










    
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User , User_details
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
import json

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserDetailsSerializer

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        is_premium_user = data.get('isPremiumUser', False)

        if not username or not email or not password:
            return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                isPremiumUser=is_premium_user,
                is_superuser=False,  # Explicitly set is_superuser
                is_staff=False       # Explicitly set is_staff
            )
            login(request, user)

            # Create JWT token
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'status': 'success',
                'message': 'User created successfully',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),

            })
        except Exception as e:
            return JsonResponse({'status': str(e), 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)




@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)

            # Create JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Send the JWT tokens, username, email, and isPremiumUser in the response
            return JsonResponse({
                'status': 'success',
                'username': user.username,
                'email': user.email,
                'isPremiumUser': user.isPremiumUser,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            })
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)




# View to handle both GET (Read) and POST (Create)
@api_view(['GET', 'POST'])
def user_list_create(request):
    # Handle GET request (read users)
    # if request.method == 'GET':
    #     print(request.data)
    #     users = User_details.objects.all()
    #     serializer = UserDetailsSerializer(users, many=True)
    #     return Response(serializer.data)

    # Handle POST request (create user)
    if request.method == 'POST':
        serializer = UserDetailsSerializer(data=request.data)
        print(request.data['username'])
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def user_fetch(request):
    username = request.data['username']
    if username:
        user = User_details.objects.filter(username = username)
        serializer = UserDetailsSerializer(user, many=True)
        print("s data : ",serializer.data)
        return Response(serializer.data)
    
    
    
    
    
    
#ML model API
    
    
@csrf_exempt
def predict(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            BMI = float(data['BMI'])
            BMR = float(data['BMR'])
            Total_Calories = float(data['Total_Calories'])
            veg_only = float(bool(data.get('veg_only', False)))
            model=DietRecommendationModel()
            # Get diet recommendation based on the input data
            recommendation =model.recommend_diet(BMI, BMR, Total_Calories, veg_only)
            
            return JsonResponse(recommendation, safe=False)

        except (KeyError, json.JSONDecodeError) as e:
            # Handle cases where data is missing or not properly formatted
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)