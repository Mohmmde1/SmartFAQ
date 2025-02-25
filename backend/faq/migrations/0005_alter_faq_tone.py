# Generated by Django 5.1.5 on 2025-02-21 17:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faq', '0004_faq_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='faq',
            name='tone',
            field=models.CharField(choices=[('formal', 'Formal'), ('neutral', 'Neutral'), ('casual', 'Casual')], default='neutral'),
        ),
    ]
