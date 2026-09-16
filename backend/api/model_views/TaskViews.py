from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from api.model_serializers.TaskSerializers import TaskSerializer
from api.models import Task, Employee


class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employee') or user.employee is None:
            return Task.objects.none()

        emp = user.employee
        # DG department can see all tasks
        if emp.department == 'DG':
            return Task.objects.all().order_by('-created_at')

        # subdirector sees tasks in their department or tasks they created
        if emp.is_subdirector:
            return Task.objects.filter(Q(assigned_to__department=emp.department) | Q(assigned_by=emp)).order_by('-created_at')

        # normal employee sees tasks assigned to them or created by them
        return Task.objects.filter(Q(assigned_to=emp) | Q(assigned_by=emp)).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'employee') or user.employee is None:
            raise Exception('Authenticated user has no Employee profile')

        assigner = user.employee
        assigned_to = serializer.validated_data.get('assigned_to')

        # Enforce assignment rules
        if assigner.department == 'DG':
            # DG can assign to anyone
            pass
        elif assigner.is_subdirector:
            # subdirector can assign only to employees in same department
            if assigned_to.department != assigner.department:
                raise serializers.ValidationError('Subdirector can only assign tasks to employees in the same department')
        else:
            # regular employees can assign only to themselves
            if assigned_to != assigner:
                raise serializers.ValidationError('You can only assign tasks to yourself')

        # set assigned_by to the current employee
        serializer.save(assigned_by=assigner)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

    def get_object(self):
        obj = super().get_object()
        # Restrict access: allow if user is DG, assigned_by, assigned_to, or subdirector of same dept
        user = self.request.user
        if not hasattr(user, 'employee') or user.employee is None:
            return obj

        emp = user.employee
        if emp.department == 'DG':
            return obj
        if obj.assigned_by == emp or obj.assigned_to == emp:
            return obj
        if emp.is_subdirector and obj.assigned_to.department == emp.department:
            return obj

        from rest_framework.exceptions import NotFound
        raise NotFound()

    def update(self, request, *args, **kwargs):
        from api.model_serializers.TaskSerializers import AssignedToTaskSerializer
        from rest_framework.exceptions import PermissionDenied

        obj = self.get_object()
        user = request.user

        if not hasattr(user, 'employee') or user.employee is None:
            return Response({'detail': 'You do not have an Employee profile.'}, status=status.HTTP_401_UNAUTHORIZED)

        emp = user.employee
        partial = kwargs.pop('partial', False)

        # assigned_to can only update the status field
        if obj.assigned_to == emp and obj.assigned_by != emp:
            # Strip everything except 'status'
            allowed_data = {k: v for k, v in request.data.items() if k == 'status'}
            serializer = AssignedToTaskSerializer(obj, data=allowed_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        # assigned_by (or DG / subdirector with access) can edit everything
        if obj.assigned_by == emp or emp.department == 'DG' or (emp.is_subdirector and obj.assigned_to.department == emp.department):
            serializer = self.get_serializer(obj, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response({'detail': 'You do not have permission to edit this task.'}, status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class TaskDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if not hasattr(user, 'employee') or user.employee is None:
            return Response({'detail': 'You do not have an Employee profile.'}, status=status.HTTP_401_UNAUTHORIZED)

        emp = user.employee

        # Only the employee who assigned (created) the task may delete it
        if obj.assigned_by != emp:
            return Response({'detail': 'Only the task creator (assigned_by) can delete this task.'}, status=status.HTTP_401_UNAUTHORIZED)

        return obj
