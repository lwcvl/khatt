from itertools import chain

from rest_framework import serializers
from .models import Annotation, AnnotatedLine, Aside, Author, Book, Chapter, Editor, Manuscript, TextField


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['name']


class EditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Editor
        fields = ['name']
        

class BookSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = ['title', 'author']

    
    def to_representation(self, instance):
        manuscripts = instance.manuscript_set
        manuscripts_serialized = ManuscriptSerializer(manuscripts, many=True).data
        return {
            'id': instance.id,
            'title': instance.title,
            'author': instance.author.name,
            'manuscripts': manuscripts_serialized
        }


class ManuscriptSerializer(serializers.ModelSerializer):
    editor = serializers.SlugRelatedField(
        queryset=Editor.objects.all(), 
        slug_field="name",
        allow_null=True)
    book = serializers.SlugRelatedField(
        queryset=Book.objects.all(),
        slug_field="title")

    class Meta:
        model = Manuscript
        fields = ['editor', 'book', 'filepath',
                  'title', 'date', 'text_direction', 'page_direction']
    
    def to_representation(self, instance):
        lines = AnnotatedLine.objects.filter(annotation__manuscript=instance.id)
        lines_serialized = AnnotationSerializerShort(lines, many=True).data
        chapters = Chapter.objects.filter(annotation__manuscript=instance.id)
        chapters_serialized = AnnotationSerializerShort(chapters, many=True).data
        asides = Aside.objects.filter(annotation__manuscript=instance.id)
        asides_serialized = AnnotationSerializerShort(asides, many=True).data

        return {
            'id': instance.id,
            'title': instance.title,
            'editor': instance.editor,
            'currently_marking': instance.currently_marking,
            'currently_annotating': instance.currently_annotating,
            'annotated_lines': lines_serialized,
            'chapters': chapters_serialized,
            'asides': asides_serialized
        }


class ManuscriptSerializerShort(serializers.ModelSerializer):
    class Meta:
        model = Manuscript
        fields = ['id', 'title']


class AnnotationSerializer(serializers.ModelSerializer):
    annotator = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    class Meta:
        model = AnnotatedLine
        fields = ['annotator', 'bounding_box']


class AnnotationSerializerShort(serializers.ModelSerializer):
    ''' Serialize the id of an annotation,
    and whether it is complete.
    '''
    class Meta:
        model = Annotation
        fields = ['id', 'complete']



class AnnotatedLineSerializer(serializers.ModelSerializer):
    ''' Serialize an annotated line, extending the annotation model.
    '''
    annotation = AnnotationSerializer()
    
    class Meta:
        model = AnnotatedLine
        fields = ['id', 'complete']
    
    def create(self, validated_data):
        annotation_data = validated_data.pop('annotation')
        annotation = Annotation.objects.create(annotation_data)
        AnnotatedLine.objects.create(validated_data, annotation=annotation)


class TextFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextField
        fields = ['id', 'page', 'bounding_box']