from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TaskSerializer

from .models import *

# Create your views here.

@api_view(['GET'])
def index(request):
    urls = {
        'Tasks List': '/tasks-list',
        'Task View': '/task/view/<str:pk>',
        'Create' : '/task-create/',
        'Update': '/task-update/<str:pk>',
        'Delete' : '/task-delete/<str:pk>',
    }

    return Response(urls)


    path('', views.index, name="index"),
    path('task/view/<str:pk>/', views.task_view, name="task_view"),
    path('task-create/', views.task_create, name="task_create"),
    path('task-update/<str:pk>', views.task_update, name="task_update"),
    path('task-delete/<str:pk>', views.task_delete, name="task_delete"),

@api_view(['GET'])
def tasks_list(request):
    tasks = Task.objects.all().order_by('-id')
    serializer = TaskSerializer(tasks, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def task_view(request, pk):
    task = Task.objects.get(id = pk)
    serializer = TaskSerializer(task, many=False)

    return Response(serializer.data)
    

@api_view(['POST'])
def task_create(request):
    serializer = TaskSerializer(data = request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
def task_update(request, pk):
    task = Task.objects.get(id = pk)
    serializer = TaskSerializer(instance = task, data = request.data)
    
    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def task_delete(request, pk):
    task = Task.objects.get(id = pk)
    task.delete()
    
    return Response("Task Succesfully deleted")
