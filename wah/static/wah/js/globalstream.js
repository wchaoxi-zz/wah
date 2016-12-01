
function likealbum(e) {
    e.preventDefault();

    var options = $(e.target).parent().parent();
    var album_id = options.attr('id');
    var likes = $(e.target).parent().next();
    console.log(album_id);
    console.log(likes.html());
    $.get("likealbum/" + album_id)
        .done(function (data) {
            likes.html(data.likenum);
        });
}


$( document ).ready(function () {
    // like album
    $('.card-action').on("click", "i.like", likealbum);


    $.get("/wah/get_tiltes_search", successFn);
    function successFn(data) {
        var titles = data.split(" ");
        console.log(data);
        var dic = {}
        for (var i = 0; i < titles.length; i++) {
            dic[titles[i]] = null;
        }
        console.log(dic)
        $('input.autocomplete').autocomplete({
            data: dic
        });
    };



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
