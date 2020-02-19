from django.contrib import admin

from api.models import AnnotatedLine, Author, Book, Manuscript, TextField

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Manuscript)
admin.site.register(TextField)
admin.site.register(AnnotatedLine)