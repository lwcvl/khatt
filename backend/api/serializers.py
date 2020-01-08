from rest_framework import serializers
from .models import Book, Manuscript, Page


class BookSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = ['title', 'author']


class ManuscriptSerializer(serializers.ModelSerializer):
    editor = serializers.StringRelatedField()
    book = serializers.StringRelatedField()

    class Meta:
        model = Manuscript
        fields = ['filepath', 'editor', 'book', 
                  'title', 'date', 'text_direction', 'page_direction']
    

# class PageSerializer(serializers.Serializer):
#     manuscript = serializers.StringRelatedField()
#     file_page_number = serializers.IntegerField()
#     manuscript_page_number = serializers.IntegerField()
#     bounding_box = serializers.JSONField()

#     def create(self, validated_data):
#         p = Page(manuscript=validated_data.manuscript, 
#                  tagline='All the latest Beatles news.')
#         return Page.objects.save(p)