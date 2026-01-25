from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import os
from datetime import datetime
#from channels.db import database_sync_to_async


def generate_filename(instance, filename):
    # Extract the file extension
    extension = os.path.splitext(filename)[1].lower()
    
    username = "UnkownTable"
    # Determine the base folder based on whether the file is for a Post or Message
    if instance.post:
        base_folder = "PostFiles"
        username = instance.post.author.username if instance.post.author else "UnknownAuthor"
    elif instance.message:
        base_folder = "messageFiles"
        username = instance.message.sender.username if instance.message.sender else "UnknownSender"
    else:
        base_folder = "OtherFiles"

    # Determine the subfolder based on the file extension
    if extension in [".jpg", ".jpeg", ".png", ".gif"]:
        sub_folder = "Images"
    elif extension in [".mp4", ".mov", ".avi", ".mkv"]:
        sub_folder = "Videos"
    elif extension in [".mp3", ".wav", ".aac"]:
        sub_folder = "Sounds"
    elif extension == ".pdf":
        sub_folder = "PDFs"
    elif extension in [".xls", ".xlsx"]:
        sub_folder = "Excel"
    elif extension in [".doc", ".docx"]:
        sub_folder = "Word"
    elif extension in [".rar", ".zip"]:
        sub_folder = "Compressed"
    else:
        sub_folder = "Other"
        
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    updateFileName = f"{username}HSN{timestamp}{filename}"

    # Construct the final file path
    return f"{base_folder}/{sub_folder}/{updateFileName}"


class Employee(models.Model):
    
    POSITIONS = (
        ('None','None'),
        ("73 Praticien spécialiste principal de sante publique","73 Praticien spécialiste principal de sante publique"),
        ("74 Praticien spécialiste assistant de sante publique","74 Praticien spécialiste assistant de sante publique"),
        ("Administrateur","Administrateur"),
        ("Administrateur analyste","Administrateur analyste"),
        ("Administrateur principal","Administrateur principal"),
        ("Agent d`administration","Agent d`administration"),
        ("Agent de bureau","Agent de bureau"),
        ("Agent de prévention de niveau 1","Agent de prévention de niveau 1"),
        ("Agent de service niveau 1 à Plein Temps","Agent de service niveau 1 à Plein Temps"),
        ("Agent de service niveau 2 à Plein Temps","Agent de service niveau 2 à Plein Temps"),
        ("Agent principal d'administration","Agent principal d'administration"),
        ("Aide-soignant de sante publique","Aide-soignant de sante publique"),
        ("Aide-soignant principal de sante publique","Aide-soignant principal de sante publique"),
        ("Amar de sante publique","Amar de sante publique"),
        ("Assistant ingénieur de niveau 2 en informatique","Assistant ingénieur de niveau 2 en informatique"),
        ("Assistant médical de sante publique","Assistant médical de sante publique"),
        ("Assistant social de sante publique","Assistant social de sante publique"),
        ("Attaché d'administration","Attaché d'administration"),
        ("Attache de laboratoire de sante publique","Attache de laboratoire de sante publique"),
        ("Attaché principal d'administration","Attaché principal d'administration"),
        ("Biologiste Du 1er Degré De Sante Publique","Biologiste Du 1er Degré De Sante Publique"),
        ("Biologiste Du 2ème Degré De Sante Publique","Biologiste Du 2ème Degré De Sante Publique"),
        ("Comptable administratif","Comptable administratif"),
        ("Comptable administratif principal","Comptable administratif principal"),
        ("Conducteur automobile de niveau 1","Conducteur automobile de niveau 1"),
        ("Diététicien de sante publique","Diététicien de sante publique"),
        ("Gardien","Gardien"),
        ("Infirmier de sante publique","Infirmier de sante publique"),
        ("Infirmier major de sante publique","Infirmier major de sante publique"),
        ("Infirmier spécialise de sante publique","Infirmier spécialise de sante publique"),
        ("Ingénieur etat en informatique","Ingénieur etat en informatique"),
        ("Ingénieur etat en statistique","Ingénieur etat en statistique"),
        ("Kinésithérapeute de sante publique","Kinésithérapeute de sante publique"),
        ("Laborantin de sante publique","Laborantin de sante publique"),
        ("Laborantin spécialise de sante publique","Laborantin spécialise de sante publique"),
        ("Manipulateur en imagerie médicale de sante publique","Manipulateur en imagerie médicale de sante publique"),
        ("Manipulateur en imagerie médicale spécialise de sante publique","Manipulateur en imagerie médicale spécialise de sante publique"),
        ("Médecin généraliste de sante publique","Médecin généraliste de sante publique"),
        ("Médecin généraliste en chef de santé publique","Médecin généraliste en chef de santé publique"),
        ("Ouvrier Professionnel de 1ère Catégorie","Ouvrier Professionnel de 1ère Catégorie"),
        ("Ouvrier Professionnel Niveau 1 à Plein Temps","Ouvrier Professionnel Niveau 1 à Plein Temps"),
        ("Ouvrier Professionnel Niveau 2 à Plein Temps","Ouvrier Professionnel Niveau 2 à Plein Temps"),
        ("Ouvrier Professionnel Niveau 4 à Plein Temps","Ouvrier Professionnel Niveau 4 à Plein Temps"),
        ("Pharmacien généraliste de sante publique","Pharmacien généraliste de sante publique"),
        ("Psychologue clinicien de sante publique","Psychologue clinicien de sante publique"),
        ("Sage-femme de sante publique","Sage-femme de sante publique"),
        ("Sage-femme principale","Sage-femme principale"),
        ("Sage-femme spécialisée de sante publique","Sage-femme spécialisée de sante publique"),
        ("Secrétaire","Secrétaire"),
        ("Technicien supérieur en informatique","Technicien supérieur en informatique"),
    )
    
    GENDER = (
        ('Male','Male'),
        ('Female','Female'),
    )

    DEPARTMENTS = (
        ('DSS', 'DSS'),
        ('DFM', 'DFM'),
        ('DRH', 'DRH'),
        ('DSI', 'DSI'),
        ('DMM', 'DMM'),
    )
    
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE, related_name="employee")
    gender = models.CharField(max_length=6, null=True, choices=GENDER)
    phone = models.CharField(max_length=10, null=True, blank=True)
    adress = models.CharField(max_length=128, null=True, blank=True)
    position = models.CharField(max_length=64, null=True, choices=POSITIONS, blank=True, default='')
    birthday = models.DateField(null=True, blank=True)
    recruitmentDate = models.DateField(null=True, blank=True)
    profile_pic = models.ImageField(null=True,blank=True, default='profile_pic.png')
    cover_pic = models.ImageField(null=True,blank=True, default='cover_pic.jpg')
    isOnline = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=False, auto_now_add=False, null=True, blank=True)
    department = models.CharField(max_length=3, choices=DEPARTMENTS, null=True, blank=True, help_text="Actual department/sub-directorate of the user")
    is_subdirector = models.BooleanField(default=False)


    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"


    def __str__(self):
        return f"User id :{self.user.pk} , {self.full_name()}" 
    
    
    def save(self, *args, **kwargs):
        # Ensure the username is always saved in lowercase
        self.user.username = self.user.username.lower()
        super(Employee, self).save(*args, **kwargs)


class Message(models.Model):
    sender = models.ForeignKey(User, null=True,related_name='sent_messages', on_delete=models.SET_NULL)
    message = models.TextField(max_length=512)
    reciever = models.ForeignKey(User, null=True, related_name='recieve_messages', on_delete=models.SET_NULL)
    date_created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    message_del = models.BooleanField(default=False)



    def __str__(self):
        return f"Message ID : {self.pk}, {self.sender.last_name} -> {self.reciever.last_name} : {self.message[:20]}"


class Post(models.Model):
    content = models.TextField(max_length=2024)
    created_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="PostAuthor")


    def __str__(self):
        return f"Post id :{self.pk} , By: {self.author.last_name} {self.author.first_name}"
        
   
class Reaction(models.Model):
    REACTIONS = (
        ('Like' , 'Like'),
        ('Dislike' , 'Dislike')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_reaction")
    reaction = models.CharField(max_length=10, choices=REACTIONS)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="ReactionRefrencePost")
    timeCreated = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Reaction on Post id : {self.post_id}"
    

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userCommenter")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="CommentRefrencePost")
    content = models.CharField(max_length=256, null=False, blank=False)
    timeCreated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment id :{self.pk} on Post id : {self.post_id}"
    
    
class File(models.Model):
    file = models.FileField(upload_to=generate_filename, null=False, blank=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='postFiles', null=True, blank=True)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='messageFiles', null=True, blank=True)
    hsl_path = models.CharField(max_length=32, null=True, blank=True)
    
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userNotification")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="postNotification")
    message = models.CharField(max_length=256, null=False, blank=False)
    timeCreated = models.DateTimeField(auto_now=True)
    is_read = models.ManyToManyField(User, related_name="readNotification")

    def __str__(self):
        return f"Notification id :{self.pk} on Post id : {self.post_id}"
    

class Task(models.Model):
    title = models.CharField(max_length=128)
    description = models.TextField(max_length=1024)
    assigned_by = models.ForeignKey(Employee, related_name='tasks_assigned', on_delete=models.CASCADE, limit_choices_to={'is_subdirector': True})
    assigned_to = models.ForeignKey(Employee, related_name='tasks_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Task: {self.title} from {self.assigned_by.full_name()} to {self.assigned_to.full_name()}"

    def clean(self):
        # Ensure assigned_to is in the same department as assigned_by
        if self.assigned_by.department != self.assigned_to.department:
            raise ValidationError("Task can only be assigned to users in the same department.")
    
