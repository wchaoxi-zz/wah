function search_friend_modalSetup() {
    var search_friends_modal = document.getElementById("search-create-modal");

    $("#search-friends").on("click",function(e) {
       search_friends_modal.style.display = "block";
    });

    $("#close").on("click",function(e) {
        search_friends_modal.style.display = "none";
    });
    $("#apply").on("click",function(e) {
    	var name = document.getElementById("friend_name").value;
    	if(name){
	    	search();
	        search_friends_modal.style.display = "none";
	    } else {
	        alert("please enter a name");
        }
    });
}

function search() {
   var name = document.getElementById("friend_name").value;
   var pattern = name.toLowerCase();
   var targetId = "";
   var finded = false;
     //only can find the first one
   var lis = document.getElementsByClassName("collection-item avatar");
   for (var i = 0; i < lis.length; i++) {
      var span_name = lis[i].getElementsByTagName("span");
      var index = span_name[0].innerText.toLowerCase().indexOf(pattern);
      if (index != -1) {
      	finded = true;
         targetId = lis[i].id;
         var ob = document.getElementById(targetId);
		 ob.style.backgroundColor="#e6ffe6";
         document.getElementById(targetId).scrollIntoView();
         // break;
      }else{
      	targetId = lis[i].id;
         var ob = document.getElementById(targetId);
		 ob.style.backgroundColor="#FFFFFF";
      }
   }
   $("#not-found").empty();
   if(finded===false){
   	$("#not-found").empty();
   	$("#not-found").append("This people is not in your friend list.");
   }
   $("#friend_name").val("");
}

$( document ).ready(function () {
    search_friend_modalSetup();

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
