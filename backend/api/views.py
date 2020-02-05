from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book, Editor, Manuscript
from .serializers import BookSerializer, ManuscriptSerializer


class BookViewSet(viewsets.ModelViewSet):
    '''
    This viewset provides standard CRUD actions.
    '''
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class ManuscriptViewSet(viewsets.ModelViewSet):
    '''
    This viewset provides standard CRUD actions.
    '''
    queryset = Manuscript.objects.all()
    serializer_class = ManuscriptSerializer