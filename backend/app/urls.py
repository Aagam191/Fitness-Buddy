from django.urls import path
from .views import CreateOrderView, VerifyPaymentView,signup_view , login_view , user_list_create , user_fetch,predict

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(), name='create_order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('register/', signup_view, name='register'),
    path('login/', login_view, name='login'),
    path('user_details/', user_list_create, name='user-list-create'),
    path('fetch_user_details/', user_fetch, name='user-fetch'),
    path('predict/',predict,name='predict')
]