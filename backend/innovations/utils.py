# utils.py
from django.views.decorators.csrf import csrf_exempt
from functools import wraps

def allow_cors(view_func):
    @wraps(view_func)
    @csrf_exempt
    def _wrapped_view(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
    return _wrapped_view
