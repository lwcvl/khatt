from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=400)
    author = models.ForeignKey('Author', on_delete=models.PROTECT)

class Manuscript(models.Model):
    LEFT_TO_RIGHT = 'ltr'
    RIGHT_TO_LEFT = 'rtl'
    DIRECTION_CHOICES = [
        (LEFT_TO_RIGHT, 'Left-to-right'),
        (RIGHT_TO_LEFT, 'Right-to-left'),
    ]
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
    filepath = models.FileField()

class Page(models.Model):
    manuscript = models.ForeignKey('Manuscript', on_delete=models.CASCADE)
    bounding_box = models.OneToOneField('Rectangle', on_delete=models.CASCADE)

class Chapter(models.Model):
    manuscript = models.ForeignKey('Manuscript', on_delete=models.CASCADE)
    same_as = models.ForeignKey('self', on_delete=models.PROTECT)

class AnnotatedLine(models.Model):
    page = models.ForeignKey('Page', on_delete=models.CASCADE)
    annotator = models.CharField(max_length=100)
    chapter = models.ForeignKey('Chapter', on_delete=models.CASCADE)
    text = models.CharField(max_length=800)
    label = models.CharField(max_length=50)
    previous_line = models.OneToOneField('self', related_name="previous", on_delete=models.PROTECT)
    next_line = models.OneToOneField('self', related_name="next", on_delete=models.PROTECT)
    bounding_box = models.OneToOneField('Rectangle', on_delete=models.CASCADE)

class Aside(models.Model):
    page = models.ForeignKey('Page', on_delete=models.PROTECT)
    chapter = models.ForeignKey('Chapter', on_delete=models.PROTECT)
    text = models.CharField(max_length=800)
    label = models.CharField(max_length=50)

class Point(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    aside = models.ForeignKey('Aside', on_delete=models.CASCADE)

class Rectangle(models.Model):
    x1 = models.IntegerField()
    y1 = models.IntegerField()
    x2 = models.IntegerField()
    y2 = models.IntegerField()

class Annotator(models.Model):
    name = models.CharField(max_length=100)

class Author(models.Model):
    name = models.CharField(max_length=100)

class Editor(models.Model):
    name = models.CharField(max_length=100)

    
