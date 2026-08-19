import json

from channels.generic.websocket import AsyncWebsocketConsumer


class AdminNotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if user is None or user.is_anonymous or not user.is_staff:
            await self.close()
            return

        await self.channel_layer.group_add(
            "admin_notifications",
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "admin_notifications",
            self.channel_name,
        )

    async def new_task_request(self, event):
        await self.send(text_data=json.dumps(event["data"], default=str))
