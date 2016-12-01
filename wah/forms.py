from django import forms

from django.contrib.auth.models import User

from django.core.validators import validate_email,RegexValidator

from wah.models import *

class RegistrationForm(forms.Form):
    username = forms.CharField(max_length = 20,
                               validators = [RegexValidator(r'^[0-9a-zA-Z]*$',
                               message='Username can only contain letters and numbers')])
    last_name = forms.CharField(max_length = 20, label = 'Last name')
    first_name = forms.CharField(max_length = 20, label = 'First name')
    email = forms.CharField(max_length = 80, label = 'E-mail',validators = [validate_email])
    password1 = forms.CharField(max_length = 200, 
                                label='Password', 
                                widget = forms.PasswordInput())
    password2 = forms.CharField(max_length = 200, 
                                label='Confirm password',  
                                widget = forms.PasswordInput())
    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")
        return cleaned_data

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already taken.")
        return username


class EditprofileForm(forms.ModelForm):

    class Meta:
        model = Profile
        exclude = ['profile_user', 'friends',"pending_friends"]
        widgets = {
            'password' : forms.PasswordInput,
            'confirm' : forms.PasswordInput
        }


    def clean(self):
        cleaned_data = super(EditprofileForm, self).clean()

        password = cleaned_data.get('password')
        con = cleaned_data.get('confirm')
        if (password or con) and password != con:
            raise forms.ValidationError("Password does not match.")

        return cleaned_data


class AlbumForm(forms.ModelForm):

    class Meta:
        model = Album
        exclude = ['user', 'cover', 'likes', 'liked_people', 'visibility']
        # widgets = {'visibility' : forms.Select(choices=Album.VISIBILITY)}


    def clean(self):
        cleaned_data = super(AlbumForm, self).clean()

        album_title = cleaned_data.get('title')

        if not album_title:
            raise forms.ValidationError("please enter a title")

        if Album.objects.filter(title=album_title).__len__() > 0:
            raise forms.ValidationError("title already exsit")

        return cleaned_data


class PictureForm(forms.ModelForm):
    album_title = forms.CharField(max_length = 20)

    class Meta:
        model = Picture
        exclude = ["pic","album"]


    def clean(self):
        cleaned_data = super(PictureForm, self).clean()

        pic_title = cleaned_data.get('title')

        if not Album.objects.filter(title=cleaned_data.get('album_title')).exists():
            raise forms.ValidationError("Please choose a valid album")
        else:
            pic_album = Album.objects.get(title=cleaned_data.get('album_title'))

        if not pic_title:
            raise forms.ValidationError("Please enter a title")

        # check for duplication
        if Picture.objects.filter(album=pic_album, title=pic_title).__len__() > 0:
            raise forms.ValidationError("Title already exsit in this album.")

        return cleaned_data