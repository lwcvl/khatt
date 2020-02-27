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
    author = AuthorSerializer()

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
    
    def create(self, validated_data):
        author_data = validated_data.pop('author')
        try:
            author = Author.objects.get(name=author_data['name'])
        except Exception:
            author = Author.objects.create(**author_data)
        return Book.objects.create(author=author, **validated_data)


class ManuscriptSerializer(serializers.ModelSerializer):
    editor = EditorSerializer()
    book = serializers.SlugRelatedField(
        queryset=Book.objects.all(),
        slug_field="title")

    class Meta:
        model = Manuscript
        fields = ['book', 'title', 'editor', 'filepath',
                   'date', 'text_direction', 'page_direction']
        validators = []
    
    def to_representation(self, instance):
        lines = AnnotatedLine.objects.filter(annotation__manuscript=instance.id)
        lines_serialized = AnnotationSerializerShort([line.annotation for line in lines], many=True).data
        chapters = Chapter.objects.filter(annotation__manuscript=instance.id)
        chapters_serialized = AnnotationSerializerShort([chapter.annotation for chapter in chapters], many=True).data
        asides = Aside.objects.filter(annotation__manuscript=instance.id)
        asides_serialized = AnnotationSerializerShort([aside.annotation for aside in asides], many=True).data
        editor_serialized = EditorSerializer(instance.editor).data['name']

        return {
            'id': instance.id,
            'title': instance.title,
            'editor': editor_serialized,
            'currently_marking': instance.currently_marking,
            'currently_annotating': instance.currently_annotating,
            'annotated_lines': lines_serialized,
            'chapters': chapters_serialized,
            'asides': asides_serialized
        }
    
    def create(self, validated_data):
        editor_data = validated_data.pop('editor')
        try:
            editor = Editor.objects.get(name=editor_data['name'])
        except Exception:
            editor = Editor.objects.create(**editor_data)
        return Manuscript.objects.create(editor=editor, **validated_data)


class AnnotationSerializer(serializers.ModelSerializer):
    annotator = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    class Meta:
        model = Annotation
        fields = ['annotator', 'bounding_box', 'complete', 'label', 'text', 'research_note']


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
    class Meta:
        model = AnnotatedLine
        fields = ['annotation', 'text_field']
        depth = 1
    
    def create(self, validated_data):
        annotation_data = validated_data.pop('annotation')
        annotation = Annotation.objects.create(**annotation_data)
        text_field = TextField.objects.get(pk=validated_data['text_field'])
        return AnnotatedLine.objects.create(annotation=annotation, text_field=text_field)


class TextFieldSerializer(serializers.ModelSerializer):
    manuscript = serializers.PrimaryKeyRelatedField(queryset=Manuscript.objects.all())
    
    class Meta:
        model = TextField
        fields = ['id', 'manuscript', 'page', 'bounding_box']