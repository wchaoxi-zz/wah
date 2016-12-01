from django.conf.urls import url
from django.contrib.auth import views

import wah.views

urlpatterns = [
    url(r'^$', wah.views.home,name='home'),
    url(r'^login$', views.login,{'template_name':'wah/login.html'},name='login'),
    url(r'^register', wah.views.register,name='register'),
    url(r'^confirm-registration/(?P<user_id>\d+)/(?P<token>[A-Za-z0-9\-]+)$',
    wah.views.confirm_registration, name='confirm'),
    url(r'^logout$', views.logout_then_login,name='logout'),
    url(r'^myalbum$', wah.views.myalbum, name='myalbum'),
    url(r'^editprofile', wah.views.editprofile, name='editprofile'),
    url(r'^getavatar/(?P<username>.+)$', wah.views.get_avatar, name='getavatar'),
    url(r'^createalbum$', wah.views.create_album, name='createalbum'),
    url(r'^getcover/(?P<id>.+)$', wah.views.get_cover, name='getcover'),
    url(r'^paint$', wah.views.paint, name='paint'),
    url(r'^friends$', wah.views.view_friends, name='friends'),
    url(r'^addfriend/(?P<username>.+)/(?P<album_id>.+)$', wah.views.add_friends, name='add_friend'),
    url(r'^removefriend/(?P<username>.+)$', wah.views.remove_friends, name='remove_friend'),
    url(r'^approvefriend/(?P<username>.+)$', wah.views.approve_friends, name='approve_friend'),
    url(r'^declinefriend/(?P<username>.+)$', wah.views.decline_friends, name='decline_friend'),
    url(r'^profileandalbum/(?P<username>.+)$', wah.views.foreign_profile, name='foreign_profile'),
    url(r'^saveimage$', wah.views.image_save, name='saveimage'),
    url(r'^image_validate$', wah.views.image_validate, name='image_validate'),
    url(r'^viewalbum/(?P<album_id>\d+)$', wah.views.view_album, name='view_album'),
    url(r'^viewalbumasguest/(?P<album_id>\d+)$', wah.views.view_album_as_guest, name='guest_view'),
    url(r'^getpictureinalbum/(?P<pic_id>\d+)$', wah.views.get_picture_in_album, name='get_pic'),
    url(r'^deletealbum/(?P<album_id>\d+)$', wah.views.delete_album, name='delete_album'),
    url(r'^likealbum/(?P<album_id>\d+)$', wah.views.like_album, name='like_album'),
    url(r'^setalbumvisibility/(?P<album_id>\d+)$', wah.views.set_album_visibility, name='album_visi'),
    url(r'^viewalbum/setalbumcover/(?P<pic_id>\d+)$', wah.views.set_pic_as_cover, name='set_as_cover'),
    url(r'^get_tiltes_search$', wah.views.get_search_title, name='search_title'),
    url(r'^search', wah.views.search_results, name='search')
]