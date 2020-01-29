# Generated by Django 3.0b1 on 2020-01-29 14:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_aside_complete'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manuscript',
            name='editor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='api.Editor'),
        ),
        migrations.AlterField(
            model_name='manuscript',
            name='filepath',
            field=models.FileField(upload_to='manuscript_images/'),
        ),
    ]
