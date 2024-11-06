from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt  # Only allows GET requests


@csrf_exempt
def welcome_view(request):
    if request.method in ['POST','GET','HEAD']:
        return JsonResponse({'status': 'Server is active', 'message': 'Welcome to MyFit'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# views.py



@csrf_exempt
def health_check(request):
    if request.method in ['GET', 'HEAD']:  # UptimeRobot might send HEAD requests too
        return JsonResponse({
            'status': 'ok',
            'message': 'Server is running'
        }, status=200)
    return JsonResponse({
        'status': 'error',
        'message': 'Method not allowed'
    }, status=405)

