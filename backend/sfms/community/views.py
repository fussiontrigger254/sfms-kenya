from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import CommunityPost
from .serializers import CommunityPostSerializer

class CommunityPostViewSet(viewsets.ModelViewSet):
    queryset = CommunityPost.objects.filter(is_active=True)
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["county", "post_type"]
    search_fields = ["title", "body"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)