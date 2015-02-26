$(document).ready(function() {
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
});

