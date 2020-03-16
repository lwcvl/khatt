from io import BytesIO

from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from wsgiref.util import FileWrapper

from .models import Annotation, AnnotatedLine, Book, Editor, Manuscript, TextField
from .serializers import AnnotationSerializer, AnnotatedLineSerializer, BookSerializer, ManuscriptSerializer, TextFieldSerializer


class BookViewSet(viewsets.ModelViewSet):
    '''
    This viewset provides standard CRUD actions.
    '''
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(status=201)
        else:
            return Response(serializer.errors, status=400)



class ManuscriptViewSet(viewsets.ModelViewSet):
    '''
    This viewset provides standard CRUD actions.
    '''
    queryset = Manuscript.objects.all()
    serializer_class = ManuscriptSerializer
    
    def create(self, request):
        request.data['editor.name'] = request.data['editor']
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(status=201)
        else:
            return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'], url_path='scan/(?P<page_no>\d+)', url_name='scan')
    def scan(self, request, page_no, pk=None):
        # To do: adjust this function such that it retrieves
        # page_no from a multiple-page pdf document
        filepath = self.get_object().filepath
        response = HttpResponse(FileWrapper(filepath), content_type='image/jpg')
        return response
    
    @action(detail=True, methods=['get'])
    def annotate_page(self, request, pk=None):
        manuscript = self.get_object()
        lines = AnnotatedLineSerializer(manuscript.annotatedline_set.filter(page=pk), many=True)
        chapters = manuscript.chapter_set.filter(page=pk)
        asides = manuscript.aside_set.filter(page=pk)
        return Response(data={'annotated_lines': lines})


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer


class AnnotatedLineViewSet(viewsets.ModelViewSet):
    queryset = AnnotatedLine.objects.all()
    serializer_class = AnnotatedLineSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=False):
            return Response(serializer.errors, status=400)
        item = self.perform_create(serializer)
        return Response({'created': AnnotatedLineSerializer(item).data['annotation']['id']})

    def perform_create(self, serializer):
        self.request.data['annotation']['annotator'] = self.request.user
        return serializer.create(validated_data=self.request.data)
    
    def retrieve(self, request, pk=None):
        queryset = AnnotatedLine.objects.all()
        line = get_object_or_404(queryset, annotation__id=pk)
        line_serialized = self.serializer_class(line).data
        return Response(line_serialized)


class TextFieldViewSet(viewsets.ModelViewSet):
    queryset = TextField.objects.all()
    serializer_class = TextFieldSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid(raise_exception=False):
            return Response({'Error': 'Object not valid'}, status=400)
        self.perform_create(serializer)
        return Response({'created': serializer.data['id']})