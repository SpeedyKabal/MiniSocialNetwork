from rest_framework import serializers
from .EmployeeSerializers import SimpleEmployeeSerializers
from api.models import Task


class TaskSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Task.Status)
    assigned_by = SimpleEmployeeSerializers()
    assigned_to = SimpleEmployeeSerializers()
    priority = serializers.ChoiceField(choices=Task.Priority)

    class Meta:
        model = Task
        fields = ["title", "description", "status", "assigned_by", "assigned_to", "created_at", "due_date", "priority", "completed_at"]
