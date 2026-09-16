from rest_framework import serializers
from .EmployeeSerializers import SimpleEmployeeSerializers
from api.models import Task, Employee


class TaskSerializer(serializers.ModelSerializer):
    # For reads show nested employee info
    assigned_by = SimpleEmployeeSerializers(read_only=True)
    assigned_to = SimpleEmployeeSerializers(read_only=True)

    # For writes accept employee PKs
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), source='assigned_to', write_only=True)

    status = serializers.ChoiceField(choices=Task.Status.choices, required=False)
    priority = serializers.ChoiceField(choices=[("LOW", "Low"), ("MEDIUM", "Medium"), ("HIGH", "High")], required=False)

    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "assigned_by", "assigned_to", "assigned_to_id", "created_at", "due_date", "priority", "completed_at"]
        read_only_fields = ["id", "created_at", "assigned_by", "assigned_to"]

    def create(self, validated_data):
        # assigned_by will be set in the view; here just create the instance
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class AssignedToTaskSerializer(serializers.ModelSerializer):
    """Restricted serializer for the assigned_to employee: only status is editable."""
    status = serializers.ChoiceField(choices=Task.Status.choices)

    class Meta:
        model = Task
        fields = ['id', 'status']
        read_only_fields = ['id']