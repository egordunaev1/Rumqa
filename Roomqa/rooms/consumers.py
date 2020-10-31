import json
from rooms.models import Chat
from channels.generic.websocket import WebsocketConsumer
from channels.db import database_sync_to_async

@database_sync_to_async
def get_chat(id):
    return Chat.objects.get(pk=id)

class ChatConsumer(WebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        user = self.scope['user']

        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))