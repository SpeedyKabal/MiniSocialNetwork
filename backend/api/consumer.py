import json
from datetime import datetime
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Message, Employee
from api.serializers import MessageSerializers
from django.conf import settings


class AsyncChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        self.room_name = self.scope['url_route']['kwargs']['roomName']
        self.room_group_name = f'chat_{self.room_name}'
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        #print(f"AsyncChatConsumer : {self.channel_name}")
        await self.accept()
        now = datetime.now()
        now_time = now.strftime("%H:%M:%S")
        print("Client :", self.scope['client'], "Connected on Room : ", self.room_name, "On :", now_time)


    async def disconnect(self, close_code):
        now = datetime.now()
        now_time = now.strftime("%H:%M:%S")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print("Client :", self.scope['client'], "Disconnected on Room : ", self.room_name, "On :", now_time)


    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle received data here
        print("Chat Class : " , data)
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'sender_id':data['sender_id'],
                    'receiver_id':data['receiver_id'],
                    'message_id': data['message_id'],
                    'command': 'chat_message'
                }
            )
        except json.JSONDecodeError as e:
            print(f"Json decode error : {e}") 
        except:
            print("Somehtin Went Wrong !!")
            
    
    async def chat_message(self, event):
        serialized_message = await self.fetchMessageFromDatabase(event['message_id'])
        if not serialized_message:
            return await self.send(text_data=json.dumps({
                'message' : "Error",
                'command': 'chat_message'
            }))
        if serialized_message:
            await self.send(text_data=json.dumps({
                'sender_id': serialized_message['sender']['id'],  # Access nested sender ID
                'receiver_id': serialized_message['reciever']['id'],  # Access nested receiver ID
                'dateMessage': serialized_message['date_created'],
                'is_read': serialized_message['is_read'],
                'message': serialized_message['message'],
                'mediaFiles': serialized_message['mediaFiles'],  # Include media files from serializer
                'command': 'chat_message'
            }))
            
            
             
    @database_sync_to_async
    def fetchMessageFromDatabase(self, id):
       # Wrap the synchronous database call with sync_to_async
       try:
           message = Message.objects.get(pk=id)
       except Message.DoesNotExist:
           return None
       messageSerialized = MessageSerializers(message).data
       print("Message Serialized : ", messageSerialized)
       domain = os.getenv("DOMAIN")  # Use the DOMAIN variable from .env
       for file in messageSerialized.get("mediaFiles", []):
           if file["hslURL"]:  # If the file is a video
               file["hslURL"] = f"{domain}{file['hslURL']}"
           else:
               file["file"] = f"{domain}{file['file']}"

       return messageSerialized




class AsyncOnlineConsumer(AsyncChatConsumer):
    async def connect(self):
        try:
            self.room_group_name = 'chat_online'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.user = self.scope["user"]
            now = datetime.now()
            now_time = now.strftime("%H:%M:%S")
            
            
            await self.accept()
                
            print("User :", self.user, "Connected on", now_time)
            await self.switchUserState({
                "user": self.user,
                "message": "isOnline"
            })
                
        except Exception as e:
            print(f'Error during online connect: {e}')


    async def disconnect(self, close_code):
        try:
            await self.switchUserState({
                "user": self.user,
                "message": "isOffline"
            })
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        except Exception as e:
            print(f"Error during online disconnect: {e}")

            
    async def receive(self, text_data):
        if text_data:
            try:
                data = json.loads(text_data)
                if data['command'] == 'SendMessage':
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'SendMessage',
                            'command': data['command'],
                            'sender': data['sender'],
                            'reciever': data['reciever'],
                            'message':data['message'],
                        }
                    )
                elif data['command'] == 'ReadMessages':
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'ReadMessages',
                            'command': data['command'],
                            'user': data['user'],
                        }
                    )
                
            except json.JSONDecodeError as e:
                print(f"Json decode error : {e}")
            except:
                print("Something Went Wrong on Class Online recieve ", data)
        else:
            print("Received empty message")
        

    async def SendMessage(self, event):
        print("SendMessage event triggered by Sender : ",event['sender'], " and by Reciever : ",event['reciever'] )
        await self.send(text_data=json.dumps({
                'command': event['command'],
                'sender':event['sender'],
                'reciever':event['reciever'],
                'message':event['message'],
            }))
        
        
    async def ReadMessages(self, event):
        print("ReadMessages event triggered")
        await self.send(text_data=json.dumps({
                'command': event['command'],
                'user':event['user'],
            }))
        
    
    async def send_ffmpeg_progress(self, event):
        await self.send(text_data=json.dumps({
                'command': "ffmpegProgress",
                'progress': event['progress'],
                'fileid' : event['fileLoopID'],
            }))
    
        
    @database_sync_to_async    
    def switchUserState(self, event):
        try:
            employeeStatus = Employee.objects.get(user = event["user"])
            if event["message"] == "isOnline":
                if not employeeStatus.isOnline:
                    employeeStatus.isOnline = True
                    employeeStatus.save()
            else:
                employeeStatus.isOnline = False
                employeeStatus.save()
                
            
        except Employee.DoesNotExist as err:
            print(f"Employee does not exist : {err}")

