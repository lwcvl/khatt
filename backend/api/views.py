from rest_framework import viewsets
from .models import Book, Manuscript
from .serializers import BookSerializer, ManuscriptSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class ManuscriptViewSet(viewsets.ModelViewSet):
    queryset = Manuscript.objects.all()
    serializer_class = ManuscriptSerializer