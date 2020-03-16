# Generated by Django 3.0b1 on 2020-03-09 12:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20200309_1355'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='annotatedline',
            name='id',
        ),
        migrations.RemoveField(
            model_name='aside',
            name='id',
        ),
        migrations.RemoveField(
            model_name='chapter',
            name='id',
        ),
        migrations.AlterField(
            model_name='annotatedline',
            name='annotation',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='annotated_line', serialize=False, to='api.Annotation'),
        ),
        migrations.AlterField(
            model_name='aside',
            name='annotation',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='aside', serialize=False, to='api.Annotation'),
        ),
        migrations.AlterField(
            model_name='chapter',
            name='annotation',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='chapter', serialize=False, to='api.Annotation'),
        ),
    ]