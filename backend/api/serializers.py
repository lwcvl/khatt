from rest_framework import serializers
from .models import AnnotatedLine, Aside, Book, Chapter, Editor, Manuscript, Page


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
        fields = ['filepath', 'editor', 'book', 
                  'title', 'date', 'text_direction', 'page_direction']
    
    def to_representation(self, instance):
        chapters = instance.chapter_set
        chapters_serialized = ChapterSerializerShort(chapters, many=True).data
        return {
            'id': instance.id,
            'title': instance.title,
            'editor': instance.editor,
            'chapters': chapters_serialized
        }


class BookSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = ['title', 'author']

    def to_representation(self, instance):
        manuscripts = instance.manuscript_set.all()
        manuscripts_serialized = ManuscriptSerializer(manuscripts, many=True).data
        return {
            'title': instance.title,
            'author': instance.author.name,
            'manuscripts': manuscripts_serialized
        }


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
        model: Page
        fields = '__all__'