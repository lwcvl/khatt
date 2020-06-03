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
    
    def to_representation(self, instance):
        return {
            instance.name
        }
        

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


class AnnotationSerializerShort(serializers.ModelSerializer):
    ''' Serialize the id of an annotation,
    and whether it is complete.
    '''
    class Meta:
        model = Annotation
        fields = ['id', 'complete']

    def to_representation(self, instance):
        try:
            instance.chapter
            annotation_type = 'chapter'
        except:
            try:
                instance.aside
                annotation_type = 'aside'
            except:
                try:
                    instance.annotated_line
                    annotation_type = 'annotated_line'
                except:
                    annotation_type = None
        return {
            'id': instance.id,
            'complete': instance.complete,
            'annotation_type': annotation_type
        }


class ManuscriptSerializer(serializers.ModelSerializer):
    editor = EditorSerializer()
    book = serializers.SlugRelatedField(
        queryset=Book.objects.all(),
        slug_field="title")
    annotations = AnnotationSerializerShort(many=True, read_only=True)

    class Meta:
        model = Manuscript
        fields = '__all__'
    
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
    manuscript = serializers.PrimaryKeyRelatedField(
        queryset=Manuscript.objects.all()
    )

    class Meta:
        model = Annotation
        fields = '__all__'


class AnnotatedLineSerializer(serializers.ModelSerializer):
    ''' Serialize an annotated line, extending the annotation model.
    '''
    previous_line = serializers.PrimaryKeyRelatedField(queryset=AnnotatedLine.objects.all(), required=False, allow_null=True)
    next_line = serializers.PrimaryKeyRelatedField(queryset=AnnotatedLine.objects.all(), required=False, allow_null=True)
    annotation = AnnotationSerializer()

    class Meta:
        model = AnnotatedLine
        fields = ['previous_line', 'next_line', 'annotation']
        depth = 1
    
    def create(self, validated_data):
        annotation_data = validated_data.pop('annotation')
        manuscript = Manuscript.objects.get(pk=annotation_data.pop('manuscript'))
        annotation = Annotation.objects.create(manuscript=manuscript, **annotation_data)
        return AnnotatedLine.objects.create(annotation=annotation)


class TextFieldSerializer(serializers.ModelSerializer):
    manuscript = serializers.PrimaryKeyRelatedField(queryset=Manuscript.objects.all())
    
    class Meta:
        model = TextField
        fields = ['id', 'manuscript', 'page', 'bounding_box']


class DownloadSerializer(serializers.ModelSerializer):
    manuscript = serializers.SlugRelatedField(read_only=True, slug_field='title')
    
    class Meta:
        model = Annotation
        fields = ['id', 'manuscript', 'page', 'text', 'label', 'research_note']