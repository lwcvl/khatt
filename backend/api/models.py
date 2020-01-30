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
    '''
    filepath = models.FileField(upload_to='manuscript_images/')
    editor = models.ForeignKey('Editor', on_delete=models.PROTECT, blank=True, null=True)
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
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


class Page(models.Model):
    ''' A page in a manuscript is the position in the digital file
    where a page is located. Usually, each page of the scan contains
    two pages of the manuscript.
    '''
    manuscript = models.ForeignKey('Manuscript', on_delete=models.CASCADE)
    file_page_number = models.IntegerField()
    manuscript_page_number = models.IntegerField()
    bounding_box = JSONField()


class Chapter(models.Model):
    ''' A chapter break as indicated in a manuscript.
    We save the text, the bounding box, and also mappings
    to a chapter in another manuscript, corresponding to this chapter.
    '''
    manuscript = models.ForeignKey('Manuscript', on_delete=models.CASCADE)
    title_text = models.CharField(max_length=100)
    bounding_box = JSONField()
    same_as = models.ForeignKey('self', on_delete=models.PROTECT)


class AnnotatedLine(models.Model):
    ''' A line in a manuscript. We register
    - which user transcribed it,
    - the page on which the line occurs
    - the chapter it's associated to,
    - annotated text
    - optional labels
    - the previous and next lines
    - optional hypotext.
    '''
    annotator = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
    page = models.ForeignKey('Page', on_delete=models.CASCADE)
    chapter = models.ForeignKey('Chapter', on_delete=models.CASCADE)
    text = models.CharField(max_length=800)
    label = models.CharField(max_length=50)
    previous_line = models.OneToOneField('self', related_name="previous", on_delete=models.PROTECT)
    next_line = models.OneToOneField('self', related_name="next", on_delete=models.PROTECT)
    bounding_box = JSONField()
    hypo_text = JSONField()
    same_as = models.ForeignKey('self', on_delete=models.PROTECT)
    complete = models.BooleanField(default=False)


class Aside(models.Model):
    ''' An aside in a manuscript.
    Similar to the AnnotatedLine model.
    As the asides are usually isolated comments, 
    there is no notion of previous / next,
    or same_as relationships.
    '''
    page = models.ForeignKey('Page', on_delete=models.PROTECT)
    chapter = models.ForeignKey('Chapter', on_delete=models.PROTECT)
    annotator = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
    text = models.CharField(max_length=800)
    label = models.CharField(max_length=50)
    bounding_box = JSONField()
    hypo_text = JSONField()
    complete = models.BooleanField(default=False)


class Author(models.Model):
    ''' The author of the book.'''
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Editor(models.Model):
    ''' The editor of a manuscript. '''
    name = models.CharField(max_length=100)

    
