from io import BytesIO

from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from wsgiref.util import FileWrapper

from .models import AnnotatedLine, Book, Editor, Manuscript, TextField
from .serializers import AnnotatedLineSerializer, BookSerializer, ManuscriptSerializer, TextFieldSerializer


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

    @action(detail=True, methods=['get'])
    def scan(self, request, pk=None):
        # To do: adjust this function such that it retrieves
        # one page from a multiple-page pdf document
        filepath = self.get_object()['filepath']
        with open(filepath, 'rb') as f:
            response = HttpResponse(FileWrapper(f), content_type='image/jpg')
        return response
    
    @action(detail=True, methods=['get'])
    def annotate_page(self, request, pk=None):
        manuscript = self.get_object()
        lines = AnnotatedLineSerializer(manuscript.annotatedline_set.filter(page=pk), many=True)
        chapters = manuscript.chapter_set.filter(page=pk)
        asides = manuscript.aside_set.filter(page=pk)
        return Response(data={'annotated_lines': lines})


class AnnotatedLineViewSet(viewsets.ModelViewSet):
    queryset = AnnotatedLine.objects.all()
    serializer_class = AnnotatedLineSerializer

    def perform_create(self, serializer):
        serializer.save(annotator=self.request.user)


class TextFieldViewSet(viewsets.ModelViewSet):
    queryset = TextField.objects.all()
    serializer_class = TextFieldSerializer