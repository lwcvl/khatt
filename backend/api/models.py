from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth import get_user_model

''' The models associated wiht the khatt application.
Most models define a "bounding box", i.e. the location (in pixels)
of a page, aside, line etc. on the page of a scan.
As these can be rectangles or polygons, these are saved as JSON,
using the GeoJSON specification.
'''

LEFT_TO_RIGHT = 'ltr'
RIGHT_TO_LEFT = 'rtl'
DIRECTION_CHOICES = [
    (LEFT_TO_RIGHT, 'Left-to-right'),
    (RIGHT_TO_LEFT, 'Right-to-left'),
]

class Book(models.Model):
    ''' A book is the virtual text, of which
    multiple manuscripts may exist.
    '''
    title = models.CharField(max_length=400)
    author = models.ForeignKey('Author', on_delete=models.PROTECT)


class Manuscript(models.Model):
    ''' A manuscript is the physical form of a book
    We have a scan of this manuscript, for which annotations are made.
    Fields:
    - filepath of the manuscript scan
    - editor of the book (can be None)
    - book of which the manuscript is a rendition
    - page (wrt file) on which the manuscript was last marked
    - page (wrt file) on which the manuscript was last annotated
    - title of the manuscript
    - date of the manuscript
    - text_direction
    - page_direction
    '''
    filepath = models.FileField(upload_to='manuscript_images/')
    editor = models.ForeignKey('Editor', on_delete=models.PROTECT, blank=True, null=True)
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    currently_marking = models.IntegerField(default=0)
    currently_annotating = models.IntegerField(default=0)
    title = models.CharField(max_length=400)
    date = models.CharField(max_length=50)
    text_direction = models.CharField(
        max_length=3,
        choices=DIRECTION_CHOICES,
        default=RIGHT_TO_LEFT,
    )
    page_direction =  models.CharField(
        max_length=3,
        choices=DIRECTION_CHOICES,
        default=RIGHT_TO_LEFT,
    )


class TextField(models.Model):
    ''' A text field occurs on a given page in a manuscript.
    It may be assigned to a given chapter.
    Within the text field, lines are marked.
    '''
    manuscript = models.ForeignKey('Manuscript', on_delete=models.PROTECT)
    page = models.IntegerField()
    bounding_box = JSONField()


class Annotation(models.Model):
    '''
    An annotation, which tracks
    - the page number in the file on which the annotation is marked
    - which user transcribed it,
    - the chapter it's associated to,
    - annotated text
    - optional labels
    - the previous and next lines
    - optional hypotext
    - optional research notes
    '''
    manuscript = models.ForeignKey('Manuscript', on_delete=models.PROTECT)
    page = models.IntegerField(default=0)
    annotator = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
    text = models.CharField(max_length=800, default='')
    label = models.CharField(max_length=50, default='')
    research_note = models.CharField(max_length=800, default='')
    bounding_box = JSONField()
    complete = models.BooleanField(default=False)


class Chapter(models.Model):
    ''' A chapter break as indicated in a manuscript.
    We save the text, the bounding box, and also mappings
    to chapters in another manuscript, corresponding to this chapter.
    '''
    annotation = models.OneToOneField('Annotation', on_delete=models.CASCADE)
    same_as = models.ForeignKey('self', related_name='corresponding', 
        on_delete=models.PROTECT, blank=True, null=True)


class AnnotatedLine(models.Model):
    ''' A line in a manuscript.
    It is an annotation within a text field,
    and also registers the previous and next lines,
    as well as (optional) hypotext.
    '''
    annotation = models.OneToOneField('Annotation', on_delete=models.CASCADE)
    text_field = models.ForeignKey('TextField', on_delete=models.PROTECT, null=True)
    previous_line = models.OneToOneField('self', related_name="previous", on_delete=models.PROTECT,
        blank=True, null=True)
    next_line = models.OneToOneField('self', related_name="next", on_delete=models.PROTECT,
        blank=True, null=True)
    hypo_text = JSONField(blank=True, null=True)


class Aside(models.Model):
    '''
    An aside is an annotation
    We extend to be able to separate asides, lines and chapters.
    '''
    annotation = models.OneToOneField('Annotation', on_delete=models.CASCADE)


class Author(models.Model):
    ''' The author of the book.'''
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Editor(models.Model):
    ''' The editor of a manuscript. '''
    name = models.CharField(max_length=100)

    
