
from django.urls import path
from . import views

urlpatterns = [
   path('upload/', views.UploadCreateView.as_view()),
    path('my-uploads/', views.MyUploadsView.as_view()),
    path('book/<int:pk>/', views.book_detail, name='book-detail'),
       path('innovations/public-list/',views.PublicationListAPIView.as_view()),
       path('book/<int:pk>/', views.public_book_detail),
       path('innovations/public-detail/<int:pk>/', views.public_innovation_detail, name='public_innovation_detail'),
]