from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

#<------------------------------ Base Models ------------------------------>#

class Image(models.Model):
    image = models.ImageField(upload_to='images/message_images/')

class Message(models.Model):
    content = models.TextField()

class Room(models.Model):
    name = models.CharField(max_length=50)
    nested_in = models.ForeignKey('Room', on_delete=models.CASCADE, related_name='nested_rooms', null=True, blank=True)
    allowed_users = models.ManyToManyField(User, related_name='allowed_rooms', blank=True)
    admin_list = models.ManyToManyField(User, related_name='admin_in', blank=True)
    description = models.TextField(default='')
    path = models.TextField()

    def __str__(self):
        return self.name


#<---------------------------------- Chat --------------------------------->#

class ChatMessage(models.Model):
    chat_message_body = models.OneToOneField('Message', on_delete=models.CASCADE)
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

class Chat(models.Model):
    room = models.OneToOneField('Room', on_delete=models.CASCADE, related_name='chat')
    #first_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats_f", null=True)
    #second_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats_s", null=True)

#<----------------------------- Question Page ----------------------------->#

class Answer(models.Model):
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='answers')
    body = models.OneToOneField('Message', on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    likes = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_answers')
    disliked_by = models.ManyToManyField(User, related_name='disliked_answers')

class Question(models.Model):
    question_page = models.ForeignKey('QuestionPage', on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=150)
    question_body = models.OneToOneField('Message', on_delete=models.CASCADE, related_name='question')
    best_answer = models.OneToOneField('Answer', on_delete=models.CASCADE, blank=True, null=True, related_name='best_in')
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ["-pk"]

class QuestionPage(models.Model):
    room = models.OneToOneField('Room', on_delete=models.CASCADE, related_name='question_page')

#<------------------------------- Task Page ------------------------------->#

class Task(models.Model):
    task_page = models.ForeignKey('TaskPage', on_delete=models.CASCADE, related_name='tasks')
    body = models.OneToOneField('Message', on_delete=models.CASCADE)
    performer_list = models.ManyToManyField(User, related_name='task_list')
    is_completed = models.BooleanField(default=False)

class TaskPage(models.Model):
    room = models.OneToOneField('Room', on_delete=models.CASCADE, related_name='task_page')


@receiver(post_save, sender=Room)
def create_room(sender, instance, created, **kwargs):
    if created:
        Chat.objects.create(room=instance)
        QuestionPage.objects.create(room=instance)

@receiver(post_save, sender=Room)
def save_room(sender, instance, **kwargs):
    instance.chat.save()
    instance.question_page.save()