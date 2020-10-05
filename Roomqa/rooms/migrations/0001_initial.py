# Generated by Django 3.0.8 on 2020-09-21 10:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('likes', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chats_f', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='images/message_images/')),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('description', models.TextField(default='')),
                ('path', models.TextField()),
                ('admin_list', models.ManyToManyField(blank=True, related_name='admin_in', to=settings.AUTH_USER_MODEL)),
                ('allowed_users', models.ManyToManyField(blank=True, related_name='allowed_rooms', to=settings.AUTH_USER_MODEL)),
                ('nested_in', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='nested_rooms', to='rooms.Room')),
            ],
        ),
        migrations.CreateModel(
            name='TaskPage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='task_page', to='rooms.Room')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_completed', models.BooleanField(default=False)),
                ('body', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='rooms.Message')),
                ('performer_list', models.ManyToManyField(related_name='task_list', to=settings.AUTH_USER_MODEL)),
                ('task_page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='rooms.TaskPage')),
            ],
        ),
        migrations.CreateModel(
            name='QuestionPage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='question_page', to='rooms.Room')),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150)),
                ('best_answer', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='best_in', to='rooms.Answer')),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('question_body', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='question', to='rooms.Message')),
                ('question_page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='rooms.QuestionPage')),
            ],
            options={
                'ordering': ['-pk'],
            },
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_messages', to='rooms.Chat')),
                ('chat_message_body', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='rooms.Message')),
                ('sender', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='chat',
            name='room',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='chat', to='rooms.Room'),
        ),
        migrations.AddField(
            model_name='chat',
            name='second_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chats_s', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='answer',
            name='body',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='rooms.Message'),
        ),
        migrations.AddField(
            model_name='answer',
            name='creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='answer',
            name='disliked_by',
            field=models.ManyToManyField(related_name='disliked_answers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='answer',
            name='liked_by',
            field=models.ManyToManyField(related_name='liked_answers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='answer',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='rooms.Question'),
        ),
    ]
