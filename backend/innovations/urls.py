
from django.urls import path
from . import views

urlpatterns = [
   path('upload/', views.UploadCreateView.as_view()),
    path('my-uploads/', views.MyUploadsView.as_view()),
    path('book/<int:pk>/', views.book_detail, name='book-detail'),

       path('book/<int:pk>/', views.public_book_detail),
      

      path('innovations/public-counts/', views.public_counts, name='public-counts'),
      path('innovations/public-list/', views.PublicUploadListAPIView.as_view(), name='public-list'),
      path('innovations/public-detail/<int:pk>/', views.PublicInnovationDetailAPIView.as_view(), name='public_innovation_detail'),
      path('innovations/rate/<int:pk>/', views.rate_document, name='rate-document'),



 path('uploads/public-list/<int:id>/like/', views.like_upload, name='like_upload'),
    path('uploads/public-list/<int:id>/unlike/', views.unlike_upload, name='unlike_upload'),



      
]