
function modalSetup() {
    var create_album_btn = $("#create-album")[0];
    var create_album_modal = $("#create-modal")[0];
    var close_modal = $("#close")[0];

    create_album_btn.onclick = function () {
       create_album_modal.style.display = "block";
    };

    close_modal.onclick = function () {
        create_album_modal.style.display = "none";
    };
}

function likealbum(e) {
    var options = $(e.target).parent().parent();
    var album_id = options.attr('id');
    var likes = options.prev()[0];
    $.get("likealbum/" + album_id)
        .done(function (data) {
            likes.innerHTML = "Likes: " + data.likenum;
        });
}

function change_visi(e) {
    e.preventDefault();
    var val = $(e.target);
    var album_id = val.parent().parent().parent().attr('id');
    var id = "icon" + album_id;
    var icon = document.getElementById(id);
    $.post("setalbumvisibility/" + album_id, {'status' : val.html()})
        .done(function(data) {
            icon.innerHTML = data.icon;
        });
}

$( document ).ready(function () {
    modalSetup();
    $('.modal-trigger').leanModal();

    // like this album
    $('.options').on("click", "i.like", likealbum);

    // change visibility of album
    $('.dropdown-content').on("click", "a.visibility", change_visi);

    // if contains error
    if ($("#error").val()) {
        $("#create-modal")[0].style.display = "block";
    }

    // visibility dropdown set-up
    $('.dropdown-button').dropdown();
    console.log("hi");

    //ajax setup
    function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
             if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                 xhr.setRequestHeader("X-CSRFToken", csrftoken);
             }
        }
    });

});
