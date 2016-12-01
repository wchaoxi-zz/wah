from django.shortcuts import render,redirect,get_object_or_404
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.core import serializers
from django.db import transaction

from django.http import HttpResponse, Http404

from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User
from django.contrib.auth import login,authenticate

from django.contrib.auth.tokens import default_token_generator

from django.core.mail import send_mail
from django.core.files.base import ContentFile

from django.utils import timezone

from datetime import datetime,timedelta
from mimetypes import guess_type

from wah.models import *
from wah.forms import *

import re,base64
import os

@transaction.atomic
def register(request):
    context={}
    if request.method=='GET':
        context['form']=RegistrationForm()
        return render(request,'wah/Registration.html',context)
    form = RegistrationForm(request.POST)
    context['form'] = form
    if not form.is_valid():
        return render(request, 'wah/Registration.html', context)
    new_user=User.objects.create_user(username=form.cleaned_data['username'],
                                      password=form.cleaned_data['password1'],
                                      first_name=form.cleaned_data['first_name'],
                                      last_name=form.cleaned_data['last_name'],
                                      email=form.cleaned_data['email'])
    new_user.is_active=False
    new_user.save()

    token = default_token_generator.make_token(new_user)

    email_body="""
    Welcome to Where Amazing Happen! Please click the link below to verify your email address and 
    complete the registration of your account: 

    http://%s%s
    """%(request.get_host(),reverse('confirm',args=(new_user.id,token)))
    send_mail(subject="Verify your email address",
              message=email_body,
              from_email="jingdonl@andrew.cmu.edu",
              recipient_list=[new_user.email])
    context['email']=form.cleaned_data['email']
    new_profile = Profile(first_name = new_user.first_name, 
                          last_name = new_user.last_name,
                          profile_user = new_user)
    
    new_profile.save()
    new_user=authenticate(username=form.cleaned_data['username'],
                          password=form.cleaned_data['password1'])

    return render(request,'wah/confirmation-needed.html',context)


@transaction.atomic
def confirm_registration(request, user_id, token):
    user = get_object_or_404(User, id=user_id)
    if not default_token_generator.check_token(user, token):
        raise Http404
    user.is_active = True
    user.save()
    return render(request, 'wah/confirmed.html', {})


@login_required
@transaction.atomic
def home(request):
    user = get_object_or_404(User,username=request.user)
    prof = get_object_or_404(Profile,profile_user=user)

    pub_albums = Album.objects.filter(visibility='P').order_by('-likes')


    context = {'user' : user, 'prof' : prof, 'albums' : pub_albums}
    return render(request,'wah/Globalstream.html',context)


@login_required
@transaction.atomic
def myalbum(request):
    user = get_object_or_404(User,username=request.user)
    prof = get_object_or_404(Profile,profile_user=user)
    form = AlbumForm()
    albums = Album.objects.filter(user=user)

    context = {'user': user, 'prof': prof, 'form' : form, 'albums' : albums}
    return render(request, 'wah/MyAlbum.html', context)


@login_required
@transaction.atomic
def create_album(request):
    if request.method == 'GET':
        raise Http404

    user = get_object_or_404(User, username=request.user)
    new_album = Album(user=user)

    form = AlbumForm(request.POST, instance=new_album)

    if not form.is_valid():
        user = User.objects.get(username=request.user)
        prof = Profile.objects.get(profile_user=user)
        albums = Album.objects.filter(user=user)

        context = {'user': user, 'prof': prof, 'form': form, 'albums': albums}
        return render(request, 'wah/MyAlbum.html', context)

    form.save()
    return redirect(reverse('myalbum'))

@login_required
@transaction.atomic
def delete_album(request, album_id):
    cur_album = get_object_or_404(Album, id=album_id)
    pictures = Picture.objects.filter(album=cur_album)

    # delete all pictures in the album
    for pic in pictures:
        pic.delete()

    # delete the album
    cur_album.delete()

    return redirect(reverse('myalbum'))


@login_required
@transaction.atomic
def like_album(request, album_id):
    cur_user = get_object_or_404(User, username=request.user)
    cur_profile = get_object_or_404(Profile, profile_user=cur_user)
    cur_album = get_object_or_404(Album, id=album_id)

    if not len(cur_album.liked_people.all().filter(id=cur_profile.id)) > 0:
        cur_album.liked_people.add(cur_profile)
        cur_album.likes += 1
        cur_album.save()

    context = {'likes' : cur_album.like_html()}
    return render(request, 'like_album.json', context, content_type="application/json")


@login_required
@transaction.atomic
def set_album_visibility(request, album_id):
    cur_album = get_object_or_404(Album, id=album_id)

    if 'status' in request.POST and request.POST['status']:
        info = request.POST['status']
        if info == 'public':
            cur_album.visibility = 'P'
        elif info == 'private':
            cur_album.visibility = 'M'
        elif info == 'friends':
            cur_album.visibility = 'F'
        cur_album.save()

    context = {'icon' : cur_album.visi_icon()}
    return render(request, 'set_visi.json', context, content_type="application/json")


@login_required
def view_album(request, album_id):
    user = get_object_or_404(User,username=request.user)
    prof = get_object_or_404(Profile,profile_user=user)

    album = get_object_or_404(Album,id=album_id)
    pictures = Picture.objects.filter(album=album)

    context = {'user': user, 'prof': prof, 'album': album, 'pictures' : pictures}
    return render(request, 'wah/ViewAlbum.html', context)


@login_required
def view_album_as_guest(request, album_id):
    album = get_object_or_404(Album,id=album_id)
    pictures = Picture.objects.filter(album=album)
    user = get_object_or_404(User,username=album.user)
    prof = get_object_or_404(Profile,profile_user=user)
    curr_prof = get_object_or_404(Profile,profile_user=request.user)
    pending = False
    friend = False
    if prof.friends.filter(username = request.user.username).count()==1 or curr_prof.friends.filter(username = user).count()==1:
        friend = True
    elif prof.pending_friends.filter(username = request.user.username).count()==1:
        pending = True
    context = {'user': user, 'prof': prof, 'album': album, 'pictures': pictures,"pending":pending,"friend":friend}
    return render(request, 'wah/ViewAlbumAsGuest.html', context)


# get pictures from an album by its id, may TODO
@login_required
@transaction.atomic
def get_picture_in_album(request, pic_id):
    pic = get_object_or_404(Picture, id=pic_id)

    if not pic.pic:
        raise Http404

    content_type = guess_type(pic.pic.name)
    return HttpResponse(pic.pic, content_type=content_type)


@login_required
@transaction.atomic
def editprofile(request):
    profile_to_edit =  get_object_or_404(Profile, profile_user=request.user)
    username = request.user

    if request.method == 'GET':
        form = EditprofileForm(instance=profile_to_edit)

        return render(request, 'wah/EditProfile.html', {'form' : form, 'username' : username,'prof':profile_to_edit})

    form = EditprofileForm(request.POST, request.FILES, instance=profile_to_edit)

    if not form.is_valid():
        return render(request, 'wah/EditProfile.html', {'form' : form, 'username' : username,'prof':profile_to_edit})

    form.save()

    new_pwd = form.cleaned_data.get('password')
    if new_pwd:
        user_tochange = profile_to_edit.profile_user
        user_tochange.set_password(new_pwd)
        user_tochange.save()
        login(request, user_tochange)

    return redirect(reverse('home'))


@login_required
def get_avatar(request, username):
    current_user = get_object_or_404(User, username=username)
    current_profile = get_object_or_404(Profile, profile_user=current_user)

    if not current_profile.photo:
        image_data = open(os.path.dirname(os.path.realpath(__file__)) + "/static/wah/images/default-avatar.jpg", "rb").read()
        return HttpResponse(image_data, content_type="image/jpg")

    content_type = guess_type(current_profile.photo.name)
    return HttpResponse(current_profile.photo, content_type=content_type)


@login_required
def get_cover(request, id):
    current_album = get_object_or_404(Album, id=id)

    if not current_album.cover:
        return Http404

    type = guess_type(current_album.cover.name)
    return HttpResponse(current_album.cover, content_type=type)

@login_required
@transaction.atomic
def paint(request):
    user = get_object_or_404(User, username=request.user)
    prof = get_object_or_404(Profile, profile_user=user)
    albums = Album.objects.filter(user=user)

    form = PictureForm()

    context = {'user': user, 'prof': prof, 'albums' : albums, 'form' : form}
    return render(request, 'wah/Paint.html', context)


@login_required
def image_validate(request):
    form = PictureForm(request.POST)
    error_message=""
    is_valid = 'true'

    if not form.is_valid():
        is_valid = 'false'
        error_message=form.non_field_errors()[0]
    context = {'is_valid' : is_valid, 'errors' : error_message}
    return render(request, 'validate_image.json', context, content_type='application/json')


@login_required
@transaction.atomic
def image_save(request):
    if request.method == 'GET':
        raise Http404

    user = get_object_or_404(User, username=request.user)
    title=request.POST["title"]
    album = get_object_or_404(Album, title=request.POST["album"])
    image_data = base64.b64decode(re.search(r'base64,(.*)', request.POST['imagedata']).group(1))
    image = ContentFile(image_data, '%s.png'%title)
    picture = Picture(pic=image,title=title,album=album)
    picture.save()

    # set this pic to be cover
    album.cover = image
    album.save()

    return HttpResponse("")


@login_required
@transaction.atomic
def set_pic_as_cover(request, pic_id):
    cur_pic = get_object_or_404(Picture, id=pic_id)
    cur_album = cur_pic.album
    cur_album.cover = cur_pic.pic

    cur_album.save()
    return HttpResponse("")

@login_required
@transaction.atomic
def view_friends(request):
    user = get_object_or_404(User,username=request.user)
    prof = get_object_or_404(Profile,profile_user=user)
    friends_profile = []
    pending_friends_profile = []
    for friend in prof.friends.all():
        friend_prof = get_object_or_404(Profile,profile_user=friend)
        friends_profile.append(friend_prof)

    for friend in prof.pending_friends.all():
        friend_prof = get_object_or_404(Profile,profile_user=friend)
        pending_friends_profile.append(friend_prof)

    context = {'user': user, 'prof': prof,'friends_profile':friends_profile,'pending_friends_profile':pending_friends_profile}
    return render(request, 'wah/friends.html', context)

@login_required
@transaction.atomic
def remove_friends(request, username):
    my_profile = get_object_or_404(Profile, profile_user=request.user)
    remove_friends = get_object_or_404(User, username=username)
    friends_profile = get_object_or_404(Profile, profile_user=remove_friends)
    if my_profile.friends.filter(username=username).count()==1 and friends_profile.friends.filter(username=request.user).count()==1:
        my_profile.friends.remove(remove_friends)
        my_profile.save()
        friends_profile.friends.remove(request.user)
        friends_profile.save()
    return redirect(reverse('friends'))

@login_required
@transaction.atomic
def approve_friends(request, username):
    my_profile = get_object_or_404(Profile, profile_user=request.user)
    approve_friends = get_object_or_404(User, username=username)
    friends_profile = get_object_or_404(Profile, profile_user=approve_friends)
    if my_profile.pending_friends.filter(username=username).count()==1 and my_profile.friends.filter(username=username).count()==0:
        my_profile.pending_friends.remove(approve_friends)
        my_profile.friends.add(approve_friends)
        friends_profile.friends.add(request.user)
        my_profile.save()
        friends_profile.save()
    return redirect(reverse('friends'))

@login_required
@transaction.atomic
def decline_friends(request, username):
    my_profile = get_object_or_404(Profile, profile_user=request.user)
    decline_friends = get_object_or_404(User, username=username)
    if my_profile.pending_friends.filter(username=username).count()==1:
        my_profile.pending_friends.remove(decline_friends)
        my_profile.save()
    return redirect(reverse('friends'))

@login_required
@transaction.atomic
def foreign_profile(request, username):
    profile_owner = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, profile_user=profile_owner)
    friends_albums = Album.objects.filter(user=profile_owner).exclude(visibility='M')
    context={"prof":profile,"albums":friends_albums,"user":profile_owner}
    return render(request, 'wah/ForeignProfileView.html', context)

@login_required
@transaction.atomic
def add_friends(request, username,album_id):
    my_profile = get_object_or_404(Profile, profile_user=request.user)
    add_friends = get_object_or_404(User, username=request.user)
    friend_prof = get_object_or_404(Profile, profile_user=username)
    if friend_prof.pending_friends.filter(username=request.user.username).count()==0 and friend_prof.friends.filter(username=request.user.username).count()==0:
        friend_prof.pending_friends.add(add_friends)
        friend_prof.save()
    return redirect(reverse('guest_view', kwargs={'album_id': album_id}))


@login_required
def get_search_title(request):
    # get all titles for search
    titles = []

    albums = Album.objects.filter(visibility='P')
    pics = Picture.objects.all()
    users = User.objects.all()

    for album in albums:
        titles.append("album:"+album.title+" ")

    for pic in pics:
        if pic.album.visibility == 'P':
            titles.append("pic:"+pic.title+" ")

    for user in users:
        titles.append("user:"+user.username+" ")

    return HttpResponse(titles)


@login_required
def search_results(request):
    if not 'msg' in request.POST or not request.POST:
        return render(request, 'wah/SearchResult.html', {})

    user = get_object_or_404(User,username=request.user)
    prof = get_object_or_404(Profile,profile_user=user)

    # get rid of :
    msg = request.POST['msg']
    if msg.find(':') != -1:
        msg = msg[msg.find(':')+1 : ]

    albums = Album.objects.filter(title__contains=msg)
    pics = Picture.objects.filter(title__contains=msg)
    users = User.objects.filter(username__contains=msg)
    profiles = []
    for prof in Profile.objects.all():
        if prof.profile_user in users:
            profiles.append(prof)

    context = {'albums' : albums, 'pictures' : pics, 'users' : profiles, 'prof' : prof}
    return render(request, 'wah/SearchResult.html', context)
