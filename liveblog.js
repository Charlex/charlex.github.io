$(document).ready(function() {

    // Tiny Sort plugin for ensuring the cards are sorted properly at any given time
    // Especially useful if a producer is ordering the collection in realtime
    !function(a,b){"use strict";function c(){return b}"function"==typeof define&&define.amd?define("tinysort",c):a.tinysort=b}(this,function(){"use strict";function a(a){function f(){0===arguments.length?j({}):d(arguments,function(a){j(c(a)?{selector:a}:a)}),q=C.length}function j(a){var b=!!a.selector,c=b&&":"===a.selector[0],d=e(a||{},s);C.push(e({bFind:b,bAttr:!(d.attr===i||""===d.attr),bData:d.data!==i,bFilter:c,mFilter:i,fnSort:d.sortFunction,iAsc:"asc"===d.order?1:-1},d))}function m(){d(a,function(a,b){x?x!==a.parentNode&&(D=!1):x=a.parentNode;var c=C[0],d=c.bFilter,e=c.selector,f=!e||d&&a.matchesSelector(e)||e&&a.querySelector(e),g=f?A:B,h={elm:a,pos:b,posn:g.length};z.push(h),g.push(h)}),w=A.slice(0)}function t(){A.sort(u)}function u(a,e){var f=0;for(0!==r&&(r=0);0===f&&q>r;){var i=C[r],j=i.ignoreDashes?o:n;if(d(p,function(a){var b=a.prepare;b&&b(i)}),i.sortFunction)f=i.sortFunction(a,e);else if("rand"==i.order)f=Math.random()<.5?1:-1;else{var k=h,m=b(a,i),s=b(e,i);if(!i.forceStrings){var t=c(m)?m&&m.match(j):h,u=c(s)?s&&s.match(j):h;if(t&&u){var v=m.substr(0,m.length-t[0].length),w=s.substr(0,s.length-u[0].length);v==w&&(k=!h,m=l(t[0]),s=l(u[0]))}}f=m===g||s===g?0:i.iAsc*(s>m?-1:m>s?1:0)}d(p,function(a){var b=a.sort;b&&(f=b(i,k,m,s,f))}),0===f&&r++}return 0===f&&(f=a.pos>e.pos?1:-1),f}function v(){var a=A.length===z.length;D&&a?(A.forEach(function(a){y.appendChild(a.elm)}),x.appendChild(y)):(A.forEach(function(a){var b=a.elm,c=k.createElement("div");a.ghost=c,b.parentNode.insertBefore(c,b)}),A.forEach(function(a,b){var c=w[b].ghost;c.parentNode.insertBefore(a.elm,c),c.parentNode.removeChild(c)}))}c(a)&&(a=k.querySelectorAll(a)),0===a.length&&console.warn("No elements to sort");var w,x,y=k.createDocumentFragment(),z=[],A=[],B=[],C=[],D=!0;return f.apply(i,Array.prototype.slice.call(arguments,1)),m(),t(),v(),A.map(function(a){return a.elm})}function b(a,b){var d,e=a.elm;return b.selector&&(b.bFilter?e.matchesSelector(b.selector)||(e=i):e=e.querySelector(b.selector)),b.bAttr?d=e.getAttribute(b.attr):b.useVal?d=e.value:b.bData?d=e.getAttribute("data-"+b.data):e&&(d=e.textContent),c(d)&&(b.cases||(d=d.toLowerCase()),d=d.replace(/\s+/g," ")),d}function c(a){return"string"==typeof a}function d(a,b){for(var c,d=a.length,e=d;e--;)c=d-e-1,b(a[c],c)}function e(a,b,c){for(var d in b)(c||a[d]===g)&&(a[d]=b[d]);return a}function f(a,b,c){p.push({prepare:a,sort:b,sortBy:c})}var g,h=!1,i=null,j=window,k=j.document,l=parseFloat,m=Array.prototype.indexOf,n=/(-?\d+\.?\d*)\s*$/g,o=/(\d+\.?\d*)\s*$/g,p=[],q=0,r=0,s={selector:i,order:"asc",attr:i,data:i,useVal:h,place:"start",returns:h,cases:h,forceStrings:h,ignoreDashes:h,sortFunction:i};return j.Element&&function(a){a.matchesSelector=a.matchesSelector||a.mozMatchesSelector||a.msMatchesSelector||a.oMatchesSelector||a.webkitMatchesSelector||function(a){for(var b=this,c=(b.parentNode||b.document).querySelectorAll(a),d=-1;c[++d]&&c[d]!=b;);return!!c[d]}}(Element.prototype),e(f,{indexOf:m,loop:d}),e(a,{plugin:f,defaults:s})}());


    // Define some starting variables
    var jsonp = $('#liveblogContainer').data('slug');
    var startdatetime = new Date($('#liveblogContainer').data("startdatetime"));
    var enddatetime = new Date($('#liveblogContainer').data("enddatetime"));
    var nowdatetime = new Date();
    var user_is_reading = false;
    var reading_target = $("#liveblogContainer").offset().top;
    var timeout = null;
    var unloaded_cards = {};
    var card_counting_array = [];

    // Determine if lifeblog is active
    // if it is active, run the refresh function on an inteverval of 10 seconds
    if ((nowdatetime > startdatetime && nowdatetime < enddatetime) || (enddatetime == "Invalid Date" || startdatetime == "Invalid Date")) {
        refreshDiv();
        setInterval(refreshDiv, 10000);
    }

    // Create a place to load new cards
    $('#liveblogContainer').prepend("<div id='new_cards'></div>");

    // Create a place to load more cards at the bottom upon user request
    $('#liveblogContainer').append("<div id='old_cards'></div>");

    // Check if the user is below the fold
    $(window).scroll(function() {
        if (!timeout) {
            timeout = setTimeout(function() {
                clearTimeout(timeout);
                timeout = null;
                if ($(window).scrollTop() >= reading_target) {
                    user_is_reading = true;
                } else {
                    user_is_reading = false;
                }
            }, 250);
        }
    });

    // When the user clicks on the new cards flag
    $(document).on("click", ".liveblog_new_cards_flag", function() {

        // Loop through the card counting array
        for (i = 0; i < card_counting_array.length; i++) {

            // Add unloaded cards to the new cards container
            $('#liveblogContainer #new_cards').append($(unloaded_cards[card_counting_array[i]]));

            load_tweet();
            load_instagram();

            // Sort them just in case things have changed
            tinysort('#liveblogContainer #new_cards .story-well-container', {
                data: 'order',
                order: 'asc'
            });

            // Slide down our new cards
            $('.story-well-container[data-card-id="' + card_counting_array[i] + '"]').slideDown();

            // Look for duplicate cards and cards that have been removed
            var found = {};
            $('[data-card-id]').each(function() {
                var $this = $(this);
                if (found[$this.data('card-id')]) {
                    $this.remove();
                } else {
                    found[$this.data('card-id')] = true;
                }
            });

        }

        // Hide the flag
        $('.liveblog_new_cards_flag').animate({
            'top': -40
        }, 400);

        // Scroll to top of page
        $('html, body').animate({
            scrollTop: 0
        }, 800);

    });

    // When user clicks to load more cards (using the button on the bottom)
    $(document).on("click", ".liveblog_load_more_cards", function() {

        // Make an Ajax call
        $.ajax({
            url: jsonp,
            dataType: "jsonp",
            jsonpCallback: "callback",
            success: function(data) {

                // Loop through all cards
                for (var i = 0; i < data.length; i++) {

                    // Look for cards older than the loaded-amount
                    if (data[i].order > $('.liveblog_load_more_cards').data('loaded-amount') && data[i].order < ($('.liveblog_load_more_cards').data('loaded-amount') + 10)) {

                        // Append the new cards
                        $('#liveblogContainer #old_cards').append("<div class='story-well-container' style='display:none;' data-card-id='" + data[i].card_id + "' data-order='" + data[i].order + "'>" + data[i].body + "</div>");

                                load_tweet();
                                load_instagram();

                                // Sort them just in case
                                tinysort('#liveblogContainer #old_cards .story-well-container', {
                                    data: 'order',
                                    order: 'asc'
                                });

                        // Reveal the newly loaded cards
                        $('.story-well-container[data-card-id="' + data[i].card_id + '"]').slideDown();
                    }
                }

                // Move up the loaded-amonut counter
                $('.liveblog_load_more_cards').data('loaded-amount', $('.liveblog_load_more_cards').data('loaded-amount') + 9);
            }
        });

    });

    // Begin our main auto refresher function
    function refreshDiv() {
        $.ajax({
            url: jsonp,
            dataType: "jsonp",
            jsonpCallback: "callback",
            success: function(data) {

                // Loop through all the cards
                for (var i = 0; i < data.length; i++) {

                    // If the card is not in the new cards container
                    if ($('#new_cards .story-well-container[data-card-id="' + data[i].card_id + '"]').length !== 0) {

                        // Set its order to the data-order
                        $('#new_cards .story-well-container[data-card-id="' + data[i].card_id + '"]').attr("data-order", data[i].order);

                        // Sort them
                        tinysort('#liveblogContainer #new_cards .story-well-container', {
                            data: 'order',
                            order: 'asc'
                        });

                        // Look for duplicate cards and cards that have been removed
                        var found = {};
                        $('[data-card-id]').each(function() {
                            var $this = $(this);
                            if (found[$this.data('card-id')]) {
                                $this.remove();
                            } else {
                                found[$this.data('card-id')] = true;
                            }
                        });
                    }

                    // If the card is in the first 25 cards 
                    if (data[i].order < 25) {

                        // And it's not already present on the page
                        if ($('.story-well-container[data-card-id="' + data[i].card_id + '"]').length === 0) {

                            // And if the user is not below the fold
                            if (!user_is_reading) {

                                // Append the card 
                                $('#liveblogContainer #new_cards').append("<div class='story-well-container' style='display:none;' data-card-id='" + data[i].card_id + "' data-order='" + data[i].order + "'>" + data[i].body + "</div>");

                                load_tweet();
                                load_instagram();

                                // Sort the card
                                tinysort('#liveblogContainer #new_cards .story-well-container', {
                                    data: 'order',
                                    order: 'asc'
                                });


                                // Reveal the card
                                $('.story-well-container[data-card-id="' + data[i].card_id + '"]').slideDown();
                            } else {
                                // If the user is below the fold

                                // And the card is not present on the page
                                if ($('.liveblog_new_cards_flag').length === 0) {

                                    // Tell the user that there is a new update using the slide down flag
                                    $('body').append("<div class='liveblog_new_cards_flag' style='top:-40px'>Load Latest Update</div>");
                                }

                                // Add the card to our unloaded_cards array, if it's not in it already
                                unloaded_cards[data[i].card_id] = "<div class='story-well-container' style='display:none;' data-card-id='" + data[i].card_id + "' data-order='" + data[i].order + "'>" + data[i].body + "</div>";
                                if (card_counting_array.indexOf(data[i].card_id) === -1) {
                                    card_counting_array.push(data[i].card_id);

                                    // Change the language of the slide down flag based on the number of unloaded cards
                                    if (card_counting_array.length === 1) {
                                        $(".liveblog_new_cards_flag").text("LOAD " + card_counting_array.length + " NEW UPDATE");
                                    } else {
                                        $(".liveblog_new_cards_flag").text("LOAD " + card_counting_array.length + " NEW UPDATES");
                                    }
                                }

                                // Responsive animation of the slide down flag
                                if ($(window).width() < 700) {
                                    $('.liveblog_new_cards_flag').animate({
                                        'top': 40
                                    }, 400);
                                } else {
                                    $('.liveblog_new_cards_flag').animate({
                                        'top': 0
                                    }, 400);
                                }
                            }
                        }
                    }

                    // If there are more than 24 cards, show a Load More Cards button
                    if (data[i].order > 24) {
                        if ($('.liveblog_load_more_cards').length === 0) {
                            $('#liveblogContainer').append("<div class='liveblog_load_more_cards' data-loaded-amount='24'>Load More Cards</div>");
                        }
                    }
                }

                // If we've shown all the cards, hide the Load More Cards button
                if ($('.story-well-container[data-card-id="' + data[data.length - 1].card_id + '"]').length !== 0) {
                    $('.liveblog_load_more_cards').fadeOut();
                }
            }
        });
    }

window.twttr = (function (d, s, id) {
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);
    return window.twttr || (t = {
        _e: [],
        ready: function (f) {
            t._e.push(f)
        }
    });
}(document, "script", "twitter-wjs"));

function load_tweet(){
    window.twttr.ready(function (twttr) {
        $('.tweet-embed[data-tweet-id]').each(function(){
            window.twttr.widgets.createTweet( $(this).data('tweet-id'), this );

            $(this).removeAttr('data-tweet-id');
        });
    });
}

function load_instagram(){

    $('.instagram-embed[data-instagram-url]').each(function(){
        var instagram_container = $(this);
        var instagram_url = $(instagram_container).data('instagram-url');
        if(instagram_url.indexOf('instagram.com') !== 0) {
            $.getJSON( "http://api.instagram.com/oembed?url=" + instagram_url + "&omitscript=true&callback=?", function( data ){
                        $(instagram_container).html(data.html);
                        $(instagram_container).removeAttr('data-instagram-url');
                        instgrm.Embeds.process();
            });
        }
    });
}

    load_tweet();
    load_instagram();


});

