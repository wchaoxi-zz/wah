from django.db import models

from django.contrib.auth.models import User

class Profile(models.Model):
    profile_user = models.ForeignKey(User)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    age = models.IntegerField(null= True, blank=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    pending_friends = models.ManyToManyField(User, related_name='pending_friends', blank=True)
    bio = models.TextField(max_length=420, blank=True)
    photo = models.ImageField(upload_to="avatars", blank=True)
    password = models.CharField(max_length=20,blank=True)
    confirm = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.first_name + self.last_name


class Album(models.Model):
    VISIBILITY = (
        ('P', 'public'),
        ('M', 'private'),
        ('F', 'friends')
    )

    user = models.ForeignKey(User)
    title = models.CharField(max_length=20)
    description = models.TextField(max_length=420, blank=True)
    # may need to change to foreignkey of Picture
    cover = models.ImageField(upload_to="images", blank=True)
    likes = models.IntegerField(default=0)
    liked_people = models.ManyToManyField(Profile)
    visibility = models.CharField(max_length=1, choices=VISIBILITY, default='M')

    def like_html(self):
        return "%d" %self.likes

    def visi_icon(self):
        if self.visibility == 'M':
            return 'lock'
        elif self.visibility == 'P':
            return 'visibility'
        else:
            return 'supervisor_account'


class Picture(models.Model):
    pic = models.ImageField(upload_to="images")
    title = models.CharField(max_length=20)
    album = models.ForeignKey(Album)

    def __str__(self):
        return self.title