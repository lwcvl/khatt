from io import BytesIO

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from wsgiref.util import FileWrapper

from .models import AnnotatedLine, Book, Editor, Manuscript, Page, TextField
from .serializers import AnnotatedLineSerializer, BookSerializer, ManuscriptSerializer, PageSerializer, TextFieldSerializer


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


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

    def retrieve(self, request, pk=None):
        queryset = self.queryset
        page = get_object_or_404(queryset, pk=pk)
        data = self.serializer_class(page).data    
        page = data['file_page_number']
        man = get_object_or_404(Manuscript.objects.all(), pk=data['manuscript'])
        filepath = ManuscriptSerializer(man).data['filepath']
        response = HttpResponse(FileWrapper(filepath), content_type='image/jpg')
        return response


class AnnotatedLineViewSet(viewsets.ModelViewSet):
    queryset = AnnotatedLine.objects.all()
    serializer_class = AnnotatedLineSerializer

    def perform_create(self, serializer):
        serializer.save(annotator=self.request.user)


class TextFieldViewSet(viewsets.ModelViewSet):
    queryset = TextField.objects.all()
    serializer_class = TextFieldSerializer