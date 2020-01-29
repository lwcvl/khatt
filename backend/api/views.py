from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book, Manuscript
from .serializers import BookSerializer, ManuscriptSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer


# class UploadManuscriptView(APIView):
#     parser_classes = [FormParser, MultiPartParser]
#     def post(self, request):
#         if request.data.get('filepath'):
#             return Response({'success': True})

class ManuscriptViewSet(viewsets.ModelViewSet):
    queryset = Manuscript.objects.all()
    serializer_class = ManuscriptSerializer