# Generated by Django 4.2.5 on 2023-11-26 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CallLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=30)),
                ('duration', models.FloatField(blank=True, null=True)),
                ('date_long', models.BigIntegerField(unique=True)),
                ('coordinates', models.CharField(max_length=150)),
                ('date', models.DateTimeField()),
                ('status', models.CharField(max_length=15)),
                ('response_status', models.CharField(blank=True, max_length=20, null=True)),
            ],
        ),
    ]
