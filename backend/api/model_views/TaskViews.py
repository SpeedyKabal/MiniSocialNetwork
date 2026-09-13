from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.model_serializers.TaskSerializers import TaskSerializer
from api.models import Task, Employee




class CreateTaskView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def perform_create(self, serializer):
        task_title = self.request.data.get('title')
        task_description = self.request.data.get('description')
        employee_assigned_by = self.request.data.get('assigned_by')
        employee_assigned_to = self.request.data.get('assigned_to')
        employee_assigned_by_depart = Employee.Objects.get(pk=employee_assigned_by).department
        employee_assigned_to_depart = Employee.Objects.get(pk=employee_assigned_to).department
        if employee_assigned_by_depart != employee_assigned_to_depart:
            return Response({'details':'Can\'t make it'}, status=status.HTTP_403_FORBIDDEN)
        task_time = self.request.data.get('due_date')
        task_status = self.request.data.get('status')
        task_priority = self.request.data.get('priority')
        if serializer.is_valid():
            serializer.save(
                title=task_title,
                description=task_description,
                assigned_by=employee_assigned_by,
                assigned_to=employee_assigned_to,
                due_date=task_time,
                status=task_status,
                priority=task_priority
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
