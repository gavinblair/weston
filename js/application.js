// Some general UI pack related JS
// Extend JS String with repeat method
String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
};

(function($) {

  // Add segments to a slider
  $.fn.addSliderSegments = function (amount) {
    return this.each(function () {
      var segmentGap = 100 / (amount - 1) + "%"
        , segment = "<div class='ui-slider-segment' style='margin-left: " + segmentGap + ";'></div>";
      $(this).prepend(segment.repeat(amount - 2));
    });
  };

var URL = "0Ai6FEf_e95YqdFZEQS05NTRycDhnUE9hejlWdm1jS0E";
var gData;
var food = [];
var geocoder;
var maps = [];

  $(function() {

    function codeAddress(address, map) {
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
          //add to spreadsheet so we don't have to grab it every time
          
          var data = [];
          data.a = 'cache';
          data.rowname = $(map.b).attr('id').split('map')[1];
          data.dataaddress = results[0].geometry.location.ob;
          data.data2price = results[0].geometry.location.pb;
          data.desc = '';
          sendData(data);


          
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }

    function sendData(data){
      var url = 'https://docs.google.com/a/rtraction.com/forms/d/12uDIBhNSD8um96JTLA6zWAK4POElFacQMN5epoy1Aio/formResponse';
      //action
      var response = "";
      response += 'entry.640333092='+data.a+'&'; //"like", "report", "cache", "submit"
      //row/name
      response+= 'entry.1305347075='+data.rowname+'&';
      //data/address
      response+= 'entry.237824469='+data.dataaddress+'&';
      //data2/price
      response+= 'entry.2005331825='+data.data2price+'&';
      //desc
      response+= 'entry.1856202876='+data.desc+'&';
      //hidden fields
      response+= 'draftResponse='+'[]&'; //there was a linebreak after the []
      response+= 'pageHistory='+'0&';
      response+= 'submit='+'Submit';

      $.ajax({
        url: url,
        crossDomain: true,
        data: response,
        type: 'post',
        success: function(msg){
          console.log(msg);
        },
        error: function (err){
          console.log(err);
        }
      });

    }

    function compare(a,b) {
      if (a.likes > b.likes)
         return -1;
      if (a.likes < b.likes)
        return 1;
      return 0;
    }

    function showInfo(data) {
      // window.tabletopData = tabletop 
      gData = data;
      geocoder = new google.maps.Geocoder();
      console.log(gData);

      for(var x in gData){
        //we're going to collapse gData down into meals
        switch(gData[x].a){
          case 'submit':
            gData[x].lat = '';
            gData[x].lng = '';
            gData[x].name = gData[x].rowname;
            gData[x].address = gData[x].dataaddress;
            gData[x].price = gData[x].data2price;
            food[gData[x].rowNumber] = gData[x];
            food[gData[x].rowNumber].likes = 0;
            food[gData[x].rowNumber].strikes = 0;
          break;
          case 'like':
            food[gData[x].rowname].likes += parseInt(gData[x].dataaddress,10);
          break;
          case 'report':
            food[gData[x].rowname].strikes += parseInt(gData[x].dataaddress,10);
            if(food[gData[x].rowname].strikes > 3){
              delete food[gData[x].rowname];
            }
          break;
          case 'cache':
            food[gData[x].rowname].lat = gData[x].dataaddress;
            food[gData[x].rowname].lng = gData[x].data2price;
          break;
        }
      }

      //todo: sort food based on likes
      food.sort(compare);
      console.log(food);

      for(var i in food){
        if(food[i].likes == 1) {
          food[i].peoplelike = "person likes";
        } else {
          food[i].peoplelike = "people like";
        }
        $('#foods').append(ich.food(food[i]));
        if(localStorage['likes'+food[i].rowNumber]){
          $('.yeah[data-row='+food[i].rowNumber+']').removeClass('btn-danger');
          $('.yeah[data-row='+food[i].rowNumber+']').addClass('btn-default');
          var youlike = '<em>You are one of these amazing people.</em>';
          if(food[i].likes == 1){
            youlike = '<em>That\'s you!.</em>';
          }
          $('.yeah[data-row='+food[i].rowNumber+']').next('.likes').children('span').html(youlike);
        }
        if(localStorage['reports'+food[i].rowNumber]){
          $('.report[data-row='+food[i].rowNumber+']').text('reported');
        }
        var mapOptions = {
          zoom: 17,
          center: new google.maps.LatLng($('#map'+food[i].rowNumber).attr('data-lat'), $('#map'+food[i].rowNumber).attr('data-lng')),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          scrollwheel: false,
          navigationControl: false,
          mapTypeControl: false,
          scaleControl: false,
          draggable: false,
          styles: [
           // {stylers: [{ visibility: 'simplified' }]},
            {elementType: 'labels', stylers: [{ visibility: 'on' }]}
          ]
        };
        maps[food[i].rowNumber] = new google.maps.Map($('#map'+food[i].rowNumber)[0], mapOptions);

        if(food[i].lat === undefined || food[i].lat === ''){
          var loc = codeAddress(food[i].address+", London Ontario", maps[food[i].rowNumber]);
        } else {
          $('#map'+food[i].rowNumber).attr('data-lat', food[i].lat);
          $('#map'+food[i].rowNumber).attr('data-lng', food[i].lng);
          maps[food[i].rowNumber].setCenter(new google.maps.LatLng($('#map'+food[i].rowNumber).attr('data-lat'), $('#map'+food[i].rowNumber).attr('data-lng')));

          var marker = new google.maps.Marker({
              map: maps[food[i].rowNumber],
              position: new google.maps.LatLng($('#map'+food[i].rowNumber).attr('data-lat'), $('#map'+food[i].rowNumber).attr('data-lng'))
          });
        }
      }
      
    }
    

    
    google.maps.event.addDomListener(window, 'load', function(){
      Tabletop.init( { key: URL, callback: showInfo, simpleSheet: true } );

      $('.add').click(function(){
        if($('#addform').css('display') == 'block') {
          //submit the form
          
          var data = [];
          data.a = 'submit';
          data.rowname = $('#name').val();
          data.dataaddress = $('#location').val();
          data.data2price = $('#price').val();
          data.desc = $('#desc').val();
          sendData(data);
          $('#addform').slideUp('fast');
          var thanks = $('<p class="intro">Thanks!</p>')
          $('.add').after(thanks);
          $('.add').hide();
          $('.woops').hide();

        } else {
          $('#addform').slideDown('fast');
          $('.woops').show();
        }
      });
      $('.woops').click(function(){
        $('#addform').slideUp('fast');
        $('.woops').hide();
      });

      $('.report').live('click', function(){
        if(!localStorage['reports'+$(this).attr('data-row')]){
          localStorage['reports'+$(this).attr('data-row')] = true;
          var data = [];
          data.a = 'report';
          data.rowname = $(this).attr('data-row');
          data.dataaddress = '1';
          data.data2price = '';
          data.desc = '';
          sendData(data);
          $(this).text('reported');
        } else {
          delete localStorage['reports'+$(this).attr('data-row')];
          var data = [];
          data.a = 'report';
          data.rowname = $(this).attr('data-row');
          data.dataaddress = '-1';
          data.data2price = '';
          data.desc = '';
          sendData(data);
          $(this).html('<span class="fui-cross"></span> report');
        }
      });
      $('.yeah').live('click',function(){
        if($(this).hasClass('btn-danger')){
          //like
          $(this).removeClass('btn-danger');
          $(this).addClass('btn-default');
          localStorage['likes'+$(this).attr('data-row')] = true;
          //add 1 to likes
          var data = [];
          data.a = 'like';
          data.rowname = $(this).attr('data-row');
          data.dataaddress = '1';
          data.data2price = '';
          data.desc = '';
          sendData(data);
          $(this).next('.likes').children('span').html('<em>Also, you like this.</em>');

        } else {
          //unlike
          $(this).removeClass('btn-default');
          $(this).addClass('btn-danger');
          $(this).children('span').removeClass('fui-cross');
          $(this).children('span').addClass('fui-heart');
          delete localStorage['likes'+$(this).attr('data-row')];
          //minus 1 from likes
          var data = [];
          data.a = 'like';
          data.rowname = $(this).attr('data-row');
          data.dataaddress = '-1';
          data.data2price = '';
          data.desc = '';
          sendData(data);          
          $(this).next('.likes').children('span').html('');

        }
      });
      $('.yeah.btn-default').live({
          'mouseenter': function(){
            $(this).children('span').removeClass('fui-heart');
            $(this).children('span').addClass('fui-cross');
          },
          'mouseleave': function(){
            $(this).children('span').removeClass('fui-cross');
            $(this).children('span').addClass('fui-heart');
          }
        });
    });
  
    // Todo list
    $(".todo li").click(function() {
        $(this).toggleClass("todo-done");
    });

    // Custom Selects
    $("select[name='huge']").selectpicker({style: 'btn-hg btn-primary', menuStyle: 'dropdown-inverse'});
    $("select[name='herolist']").selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'});
    $("select[name='info']").selectpicker({style: 'btn-info'});

    // Tooltips
    $("[data-toggle=tooltip]").tooltip("show");

    // Tags Input
    $(".tagsinput").tagsInput();

    // jQuery UI Sliders
    var $slider = $("#slider");
    if ($slider.length) {
      $slider.slider({
        min: 1,
        max: 5,
        value: 2,
        orientation: "horizontal",
        range: "min"
      }).addSliderSegments($slider.slider("option").max);
    }

    // Placeholders for input/textarea
    $("input, textarea").placeholder();

    // Make pagination demo work
    $(".pagination a").on('click', function() {
      $(this).parent().siblings("li").removeClass("active").end().addClass("active");
    });

    $(".btn-group a").on('click', function() {
      $(this).siblings().removeClass("active").end().addClass("active");
    });

    // Disable link clicks to prevent page scrolling
    $('a[href="#fakelink"]').on('click', function (e) {
      e.preventDefault();
    });

    // Switch
    $("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
    
  });
  
})(jQuery);