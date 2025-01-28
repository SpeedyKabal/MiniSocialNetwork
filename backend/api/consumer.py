import json
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Message, Employee


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
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'sender_id':data['sender_id'],
                    'receiver_id':data['receiver_id'],
                    'message': data['message'],
                    'command': 'chat_message'
                }
            )
        except json.JSONDecodeError as e:
            print(f"Json decode error : {e}") 
        except:
            print("Somehtin Went Wrong !!")
            
    
    async def chat_message(self, event):
        message = await self.fetchMessageFromDatabase(event)
        if not message:
            return await self.send(text_data=json.dumps({
                'message' : "Error",
                'command': 'chat_message'
            }))
        MessageDate = message.date_created
        if message:
            await self.send(text_data=json.dumps({
            'sender_id':message.sender_id,
            'receiver_id':message.reciever_id,
            'dateMessage' : f'{MessageDate}',
            'is_read' : message.is_read,
            'message' : message.message,
            'command': 'chat_message'
            }))
            
            
             
    @database_sync_to_async
    def fetchMessageFromDatabase(self, event):
       # Wrap the synchronous database call with sync_to_async
        return Message.objects.filter(
                sender_id=event["sender_id"],
                reciever_id=event["receiver_id"],
                message=event["message"]
            ).last()


active_users = {}

class AsyncOnlineConsumer(AsyncChatConsumer):
    
    async def connect(self):
        try:
            self.room_group_name = 'chat_online'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            #print(f"AsyncOnlineConsumer : {self.channel_name}")
            
            if self.room_group_name in active_users:
                active_users[self.room_group_name] += 1
            else:
                active_users[self.room_group_name] = 1
                
            print("Number Online :", active_users)
                
        except Exception as e:
            print(f'Error during online connect: {e}')


    async def disconnect(self, close_code):
        try:
            active_users[self.room_group_name] -= 1
            if active_users[self.room_group_name] <= 0:
                await self.makeAllUsersOffline()
            print("WebSocket disconnect received with close code:", close_code)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            print("Number rest Connected :" , active_users)
        except Exception as e:
            print(f"Error during online disconnect: {e}")

            
    async def receive(self, text_data):
        if text_data:
            try:
                data = json.loads(text_data)
                if data['command'] == 'Online':
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'online',
                            'command': data['command'],
                            'user': data['user'],
                            'message': data['message'],
                        }
                    )
                elif data['command'] == 'SendMessage':
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
        
        
    async def online(self, event):
        print("Online event triggered by User : ", event["user"])
        await self.switchUserState(event)
        await self.send(text_data=json.dumps({
                'user':event['user'],
                'message':event['message'],
                'command': event['command']
            }))
        
    
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
    
        
    @database_sync_to_async    
    def switchUserState(self, event):
        try:
            employeeStatus = Employee.objects.get(user_id = event["user"])
            if event["message"] == "isOnline":
                if not employeeStatus.isOnline:
                    employeeStatus.isOnline = True
                    employeeStatus.save()
            else:
                employeeStatus.isOnline = False
                employeeStatus.save()
                
            
        except Employee.DoesNotExist as err:
            print(f"Employee does not exist : {err}")
            
            
    @database_sync_to_async
    def makeAllUsersOffline(self):
        lastActiveUser = Employee.objects.filter(isOnline=True)
        if lastActiveUser:
            for row in lastActiveUser:
                print(row)
                if row.isOnline:
                    row.isOnline = False
                    row.save()