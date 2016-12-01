var  original_data="";

function draw(){
    var canvas = document.getElementById("myCanvas"),
    ctx = canvas.getContext("2d"),
    painting = false,
    lastX = 0,
    lastY = 0,
    tool = "pencil",
    lineThickness = 1;


    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    original_data = ctx.getImageData(0,0,canvas.width, canvas.height);


    var container = canvas.parentNode;
        canvas_temp = document.createElement('canvas');

        canvas_temp.id     = 'canvasTemp';
        canvas_temp.width  = canvas.width;
        canvas_temp.height = canvas.height;
        container.appendChild(canvas_temp);
        ctx_temp = canvas_temp.getContext("2d");
        $("#canvasTemp").css({"top": "0", "left": "0"});

    $("#canvasTemp").mousedown(function(e){
        painting = true;
        ctx_temp.fillStyle = $("#select_color").val();
        ctx_temp.strokeStyle=$("#select_color").val();
        var rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    $("#pencil").on("click",function(){
        tool = "pencil";
    })
    $("#rect").on("click",function(){
        tool = "rect";
    })

    $("#canvasTemp").mouseup(function(e){
        painting = false;
        ctx.drawImage(canvas_temp, 0, 0);
        ctx_temp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
    });

    $('#canvasTemp').mouseleave(function(e){
        painting = false;
    });

    $("#canvasTemp").mousemove(function(e){
        if (painting) {
            if (tool==="pencil"){
                var rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                // find all points between        
                var x1 = mouseX,
                    x2 = lastX,
                    y1 = mouseY,
                    y2 = lastY;
                var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
                if (steep){
                    var x = x1;
                    x1 = y1;
                    y1 = x;
                    var y = y2;
                    y2 = x2;
                    x2 = y;
                }
                if (x1 > x2) {
                    var x = x1;
                    x1 = x2;
                    x2 = x;
                    var y = y1;
                    y1 = y2;
                    y2 = y;
                }
                var dx = x2 - x1,
                    dy = Math.abs(y2 - y1),
                    error = 0,
                    de = dy / dx,
                    yStep = -1,
                    y = y1;       
                if (y1 < y2) {
                    yStep = 1;
                }       
                lineThickness = 5 - Math.sqrt((x2 - x1) *(x2-x1) + (y2 - y1) * (y2-y1))/10;
                if(lineThickness < 1){
                    lineThickness = 1;   
                }
                for (var x = x1; x < x2; x++) {
                    if (steep) {
                        ctx_temp.fillRect(y, x, lineThickness , lineThickness );
                    } else {
                        ctx_temp.fillRect(x, y, lineThickness , lineThickness );
                    }           
                    error += de;
                    if (error >= 0.5) {
                        y += yStep;
                        error -= 1.0;
                    }
                }
                lastX = mouseX;
                lastY = mouseY;
            }else if(tool==="rect"){

                var rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;

                var x1 = mouseX,
                    x2 = lastX,
                    y1 = mouseY,
                    y2 = lastY;

                var x = Math.min(x1,  x2),
                    y = Math.min(y1,  y2),
                    w = Math.abs(x1 - x2),
                    h = Math.abs(y1 - y2);
                ctx_temp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);

                if (!w || !h) {
                    return;
                }
                ctx_temp.strokeRect(x, y, w, h);

            }
        }
    });

    $("#clear").on("click",function(e){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width=600;
        canvas.height=400;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tool = "pencil";
        ctx_temp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
        canvas_temp.width=600;
        canvas_temp.height=400;
        $("#select_color").val("#000000");
    })

    $("#download_image").on("click",function(e){
        this.href = canvas.toDataURL("image/png", 1.0);
        this.download = "masterpiece.png"
    })

    $("#image_upload_bind").on("click",function(e){
        $("#image_upload").val("");
        $("#image_upload").click();
    })

    $("#image_upload").change(function(e){
        var canvas = document.getElementById("myCanvas"),
            ctx = canvas.getContext("2d"),
            canvas_temp=document.getElementById("canvasTemp"),
            ctx_temp = canvas_temp.getContext("2d");
            var reader = new FileReader();
            reader.onload = function(event){
                var img = new Image();
                img.onload = function(){
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img,0,0);
                    canvas_temp.width = img.width;
                    canvas_temp.height = img.height;
                    original_data = ctx.getImageData(0,0,canvas.width, canvas.height)
                }
                img.src = event.target.result;
            }
        reader.readAsDataURL(e.target.files[0]);
    })

    
}

function add_filter(){
    $("#select_filter").change(function(){
        var filter_name=$("#select_filter").val();
        if(filter_name==="none_filter"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="blur"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 10,
              value: 3,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="brightness"){
            $( "#filter_para" ).slider({
              min: -10,
              max: 10,
              value: 0,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="bump"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="contrast"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 20,
              value: 10,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="diffusion"){
            $( "#filter_para" ).slider({
              min: 1,
              max: 100,
              value: 4,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="dither"){
            $( "#filter_para" ).slider({
              min: 2,
              max: 30,
              value: 3,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="edge_detection"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="exposure"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 50,
              value: 10,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="gamma"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 20,
              value: 10,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="grayscale"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="hue"){
            $( "#filter_para" ).slider({
              min: -10,
              max: 10,
              value: 0,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="invert"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="maximum"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="median"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="minimum"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="noise"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 100,
              value: 25,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="oil_painting"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 50,
              value: 30,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="opacity"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 100,
              value: 100,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="pixelation"){
            $( "#filter_para" ).slider({
              min: 1,
              max: 50,
              value: 5,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="posterize"){
            $( "#filter_para" ).slider({
              min: 2,
              max: 30,
              value: 6,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="saturation"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 20,
              value: 10,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="sepia"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 30,
              value: 10,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="sharpen"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="solarize"){
            $( "#filter_para" ).slider( {disabled: true});
            $( "#amount" ).val("");
        }else if(filter_name==="blackandwhite"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 255,
              value: 127,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }else if(filter_name==="vignette"){
            $( "#filter_para" ).slider({
              min: 0,
              max: 10,
              value: 3,
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
              }
            });
            $( "#filter_para" ).slider("enable");
            $( "#amount" ).val( $( "#filter_para" ).slider( "value" ) );
        }
    });
    $("#apply").on("click",function(){
        var canvas = document.getElementById("myCanvas"),
            ctx = canvas.getContext("2d");
        var data = ctx.getImageData(0,0,canvas.width, canvas.height);
        var filter_name=$("#select_filter").val();
        var amount_value=parseFloat($("#amount").val());
        if(filter_name==="none_filter"){
            ctx.putImageData(original_data,0,0);
        }else if(filter_name==="blur"){
            JSManipulate.blur.filter(data,{amount:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="brightness"){
            JSManipulate.brightness.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="bump"){
            JSManipulate.bump.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="contrast"){
            JSManipulate.contrast.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="diffusion"){
            JSManipulate.diffusion.filter(data,{scale:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="dither"){
            JSManipulate.dither.filter(data,{levels:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="edge_detection"){
            JSManipulate.edge.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="exposure"){
            JSManipulate.exposure.filter(data,{exposure:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="gamma"){
            JSManipulate.gamma.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="grayscale"){
            JSManipulate.grayscale.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="hue"){
            JSManipulate.hue.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="invert"){
            JSManipulate.invert.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="maximum"){
            JSManipulate.maximum.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="median"){
            JSManipulate.median.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="minimum"){
            JSManipulate.minimum.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="noise"){
            JSManipulate.noise.filter(data,{amount:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="oil_painting"){
            JSManipulate.oil.filter(data,{range:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="opacity"){
            JSManipulate.oil.filter(data,{amount:amount_value/100}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="pixelation"){
            JSManipulate.pixelate.filter(data,{size:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="posterize"){
            JSManipulate.posterize.filter(data,{levels:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="saturation"){
            JSManipulate.saturation.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="sepia"){
            JSManipulate.sepia.filter(data,{amount:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="sharpen"){
            JSManipulate.sharpen.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="solarize"){
            JSManipulate.solarize.filter(data); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="blackandwhite"){
            JSManipulate.threshold.filter(data,{threshold:amount_value}); 
            ctx.putImageData(data,0,0);
        }else if(filter_name==="vignette"){
            JSManipulate.vignette.filter(data,{amount:amount_value/10}); 
            ctx.putImageData(data,0,0);
        }
    })
}

function save_image_modalSetup() {
    var save_image_modal = document.getElementById("create-modal-save-image");

    $("#image_save").on("click",function(e) {
       save_image_modal.style.display = "block";
    });

    $("#close-save-image").on("click",function(e) {
        save_image_modal.style.display = "none";
    });
}

function add_filter_modalSetup() {
    var add_filter_modal = document.getElementById("create-modal-add-filter");

    $("#add_filter").on("click",function(e) {
       add_filter_modal.style.display = "block";
    });

    $("#close-add-filter").on("click",function(e) {
        add_filter_modal.style.display = "none";
    });
    $("#apply").on("click",function(e) {
        add_filter_modal.style.display = "none";
    });
}

function imagesave(){
        $(document).on('submit',"form.image_to_save",function(event) {
        event.preventDefault();// Prevent form from being submitted
        var dataURL = document.getElementById('myCanvas').toDataURL("image/png", 1.0);
        var image_title=$('#image_title').val();
        var album_save=$('#save_to_album').val();
        $.ajax({
            type: "POST",
            url: "/wah/image_validate",
            datatype: 'json',
            data: {'imagedata':dataURL,"title":image_title,"album_title":album_save},
            success: function(data) {
                if (data.is_valid==='true'){
                    $.ajax({
                        type: "POST",
                        url: "/wah/saveimage",
                        datatype: 'json',
                        data:{'imagedata':dataURL,"title":image_title,"album":album_save},
                        success: function(data) {
                             var save_image_modal = $("#create-modal-save-image")[0];
                             save_image_modal.style.display = "none";
                             alert("saved to album!");
                             //console.log('success');
                        },
                        error: function() {
                            console.log('error');
                        }
                    })
                }else{
                    $('#error_messages').append("<p>"+data.errors+"</p>")
                }        
            },
            error: function() {
                console.log('error');
            }
        });
    });

}

$( document ).ready(function() {  // Runs when the document is ready
  save_image_modalSetup();
  add_filter_modalSetup()
  draw();
  add_filter();
  imagesave();
  $('select').material_select();

  // using jQuery
  // https://docs.djangoproject.com/en/1.10/ref/csrf/
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
    // these HTTP methods do not require CSRF protection
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

