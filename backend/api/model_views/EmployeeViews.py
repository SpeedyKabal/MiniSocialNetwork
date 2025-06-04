# Employee-related views

from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from api.serializers import EmployeeSerializers, EmployeeProfilePicture, EmployeeUpdateSerializers
from api.models import Employee

class UpdateEmployeeView(generics.UpdateAPIView):
    serializer_class = EmployeeUpdateSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        return Employee.objects.get(user=user)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActualEmployeeView(generics.RetrieveAPIView):
    serializer_class = EmployeeSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_username = self.kwargs.get('username')
        user = User.objects.get(username=user_username)
        currentProfile = Employee.objects.get(user=user)
        return currentProfile 
    

class UpdateProfilePictureView(generics.UpdateAPIView):
    serializer_class = EmployeeProfilePicture
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.employee   
        except Employee.DoesNotExist:
            Response ("Employee Doen't Existe")
    
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  

def get_positions(request):
    positions = [
        {'value': position[0], 'label': position[1]} for position in Employee.POSITIONS
    ]
    return JsonResponse(positions, safe=False)

def get_genders(request):
    genders = [
        {'value': gender[0], 'label': gender[1]} for gender in Employee.GENDER
    ]
    return JsonResponse(genders, safe=False)
