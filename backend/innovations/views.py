# uploads/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Upload
from rest_framework import generics
from .serializers import UploadSerializer
from profiles.models import ResearcherProfile
from rest_framework.decorators import api_view, permission_classes
from .serializers import BookDetailSerializer,PublicUploadSerializer

class UploadCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # 1. Profile Check — Perfect
        try:
            profile = request.user.researcher_profile
            if not profile.profile_complete:
                return Response(
                    {"error": "Please complete your profile before uploading research."},
                    status=403
                )
        except AttributeError:
            return Response(
                {"error": "Profile not found. Please create your profile first."},
                status=403
            )

        # 2. Extract & Validate submission_type — Excellent!
        raw_submission = request.data.get("submission_type", "").strip().lower()
        if not raw_submission or "-" not in raw_submission:
            return Response(
                {"submission_type": ["Must be in format: thesis-law or dissertation-medicine"]},
                status=400
            )

        try:
            degree_part, field_part = raw_submission.split("-", 1)
            if degree_part not in ["thesis", "dissertation"]:
                return Response(
                    {"submission_type": ["First part must be 'thesis' or 'dissertation'"]},
                    status=400
                )
            if not field_part.strip():
                return Response(
                    {"submission_type": ["Field of study cannot be empty"]},
                    status=400
                )
        except ValueError:
            return Response(
                {"submission_type": ["Invalid format"]},
                status=400
            )

        # Normalize the value (clean & consistent)
        submission_type = f"{degree_part}-{field_part.strip().replace(' ', '_')}"

        # 3. Build data
        data = {
            "submission_type": submission_type,
            "university": request.data.get("university", "").strip(),
            "title": request.data.get("title", "").strip(),
            "authors": request.data.get("authors", "").strip(),
            "year": request.data.get("year"),
            "description": request.data.get("description", "").strip(),
            "supervisor_name": request.data.get("supervisor_name", "").strip(),
        }

        # 4. Files
        files = {"file": request.FILES.get("file")}
        if request.FILES.get("cover_image"):
            files["cover_image"] = request.FILES.get("cover_image")

        # 5. University required for thesis/dissertation
        if degree_part in ["thesis", "dissertation"] and not data["university"]:
            return Response(
                {"university": ["This field is required for thesis/dissertation submissions."]},
                status=400
            )

        # 6. Final serializer — Let it do the rest
        serializer = UploadSerializer(data={**data, **files}, context={'request': request})
        if serializer.is_valid():
            upload = serializer.save(user=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    


class PublicPublicationList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Upload.objects.filter(status='approved').order_by('-uploaded_at')
    serializer_class = UploadSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    
    # Search in all important fields
    search_fields = [
        'title', 'authors', 'supervisor_name',
        'description', 'submission_type', 'university'
    ]
    
    # Filter by degree_type (thesis/dissertation)
    filterset_fields = ['degree_type']

    # Allow filtering by submission_type parts
    def get_queryset(self):
        queryset = super().get_queryset()
        # Example: ?field=engineering → search submission_type__contains=engineering
        field = self.request.query_params.get('submission_type__contains')
        if field:
            queryset = queryset.filter(submission_type__icontains=field)
        return queryset

# 2. COUNTS ENDPOINT – Live numbers on buttons

@api_view(['GET'])
@permission_classes([AllowAny])
def public_counts(request):
    
    base = Upload.objects.filter(status='approved')
    
    degree = request.GET.get('degree_type', '')
    if degree in ['thesis', 'dissertation']:
        base = base.filter(degree_type=degree)

    counts = {
        'thesis': Upload.objects.filter(status='approved', degree_type='thesis').count(),
        'dissertation': Upload.objects.filter(status='approved', degree_type='dissertation').count(),
        'engineering': base.filter(submission_type__icontains='engineering').count(),
        'medicine': base.filter(submission_type__icontains='medicine').count(),
        'law': base.filter(submission_type__icontains='law').count(),
        'computer_science': base.filter(submission_type__icontains='computer_science').count(),
        'education': base.filter(submission_type__icontains='education').count(),
        'business': base.filter(submission_type__icontains='business').count(),
        'social_sciences': base.filter(submission_type__icontains='social').count(),
        'natural_sciences': base.filter(submission_type__icontains='science').exclude(submission_type__icontains='social').count(),
        # Add more as needed
    }
    
    return Response(counts)
class MyUploadsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        uploads = Upload.objects.filter(user=request.user).order_by('-uploaded_at')
        return Response(UploadSerializer(uploads, many=True).data)








@api_view(['GET'])
@permission_classes([AllowAny])
def book_detail(request, pk):
    try:
        book = Upload.objects.get(pk=pk, user=request.user, status='approved')
        serializer = BookDetailSerializer(book, context={'request': request})
        return Response(serializer.data)
    except Upload.DoesNotExist:
        return Response({'error': 'Book not found'}, status=404)




class PublicationListAPIView(generics.ListAPIView):
    queryset = Upload.objects.all() 
    serializer_class = UploadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = self.queryset
        # Get the 'field' query parameter from the frontend
        field = self.request.query_params.get('field', None)
        
        if field is not None:
            # Filters based on the 'field_of_study' property (case-insensitive)
            queryset = queryset.filter(field_of_study__iexact=field) 
            
        return queryset.order_by('-uploaded_at')



@api_view(['GET'])
@permission_classes([AllowAny])
def public_book_detail(request, pk):
    try:
        book = upload.objects.get(pk=pk)
    except Book.DoesNotExist:
        return Response(status=404)
    
    serializer = BookSerializer(book)
    return Response(serializer.data)

# views.py
@api_view(['GET'])
@permission_classes([AllowAny])
def public_innovation_detail(request, pk):
    try:
        upload = Upload.objects.get(pk=pk, status='approved') 
    except Upload.DoesNotExist:
        return Response(status=404)
        
    # 🛑 CRITICAL FIX: Pass context={'request': request} 🛑
    serializer = PublicUploadSerializer(upload, context={'request': request}) 
    return Response(serializer.data)