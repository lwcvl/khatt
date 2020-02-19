from itertools import chain

from rest_framework import serializers
from .models import AnnotatedLine, Aside, Author, Book, Chapter, Editor, Manuscript, Page, TextField


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
    # editor = EditorSerializer()
    book = serializers.SlugRelatedField(
        queryset=Book.objects.all(),
        slug_field="title")

    class Meta:
        model = Manuscript
        fields = ['filepath', 'editor', 'book', 
                  'title', 'date', 'text_direction', 'page_direction']
    
    def to_representation(self, instance):
        chapters = instance.chapter_set
        chapters_serialized = ChapterSerializerShort(chapters, many=True).data
        relevant_page = instance.page_set.get(file_page_number=instance.current_page)
        text_fields = relevant_page.textfield_set.all()
        annotated_lines = [tf.annotatedline_set.all() for tf in text_fields]
        annotated_serialized = AnnotatedLineSerializerShort(list(chain(*annotated_lines)), many=True).data

        return {
            'id': instance.id,
            'title': instance.title,
            'filepath': str(instance.filepath),
            'editor': instance.editor,
            'chapters': chapters_serialized,
            'current_page': instance.current_page,
            'annotated_lines': annotated_serialized
        }


class ManuscriptSerializerShort(serializers.ModelSerializer):
    class Meta:
        model = Manuscript
        fields = ['id', 'title']


class ChapterSerializerShort(serializers.ModelSerializer):
    ''' Serialize the id, as well as the annotated lines and asides
    associated with a chapter.
    '''
    class Meta:
        model = Chapter
        fields = ['id', 'annotated_line_set', 'aside_set']

    def to_representation(self, instance):
        lines_serialized = AnnotatedLineSerializerShort(
            instance.annotated_line_set, many=True
        ).data
        asides_serialized = AsideSerializerShort(
            instance.aside_set, many=True
        ).data
        return {
            'id': instance.id,
            'annotated_line_set': lines_serialized,
            'aside_set': asides_serialized
        }


class AnnotatedLineSerializer(serializers.ModelSerializer):
    annotator = serializers.PrimaryKeyRelatedField(
        read_only=True
    )
    text_field = serializers.PrimaryKeyRelatedField(queryset=TextField.objects.all())

    class Meta:
        model = AnnotatedLine
        fields = ['annotator', 'text_field', 'bounding_box']


class AnnotatedLineSerializerShort(serializers.ModelSerializer):
    ''' Serialize the id of an annotated line,
    and whether its annotation is complete.
    '''
    class Meta:
        model = AnnotatedLine
        fields = ['id', 'complete']


class AsideSerializerShort(serializers.ModelSerializer):
    ''' Serialize the id of an aside,
    and whether its annotation is complete.
    '''
    class Meta:
        model = Aside
        fields = ['id', 'complete']


class PageSerializer(serializers.ModelSerializer):
    manuscript = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Page
        fields = ['manuscript', 'file_page_number']


class TextFieldSerializer(serializers.ModelSerializer):
    page = serializers.PrimaryKeyRelatedField(queryset=Page.objects.all())
    
    class Meta:
        model = TextField
        fields = ['id', 'page', 'bounding_box']