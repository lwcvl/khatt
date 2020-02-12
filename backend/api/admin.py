from django.contrib import admin

from api.models import Author, Book, Manuscript, Page

admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Manuscript)
admin.site.register(Page)