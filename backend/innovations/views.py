# uploads/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Upload
from rest_framework import generics
from .serializers import UploadSerializer
from profiles.models import ResearcherProfile
from rest_framework.decorators import api_view, permission_classes
from .serializers import BookDetailSerializer

class UploadCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            profile = request.user.researcher_profile
        except ResearcherProfile.DoesNotExist:
            return Response({'error': 'Complete your profile first'}, status=403)

        if not profile.profile_complete:
            return Response({'error': 'Complete your profile first'}, status=403)

        data = request.data.copy()
        data['user'] = request.user.id

        submission_type = data.get('submission_type')
        if submission_type in ['thesis', 'masters', 'bachelor']:
            if not data.get('university'):
                return Response({'university': ['Required.']}, status=400)

        serializer = UploadSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

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
    serializer = PublicUploadSerializer(upload)
    return Response(serializer.data)