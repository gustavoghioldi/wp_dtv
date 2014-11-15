/*
 * WordPress Ajax Load More
 * https://github.com/dcooney/wordpress-ajax-load-more
 *
 * Copyright 2014 Connekt Media - http://cnkt.ca/ajax-load-more/
 * Free to use under the GPLv2 license.
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Author: Darren Cooney
 * Twitter: @KaptonKaos
 */
(function ($) {
    "use strict";
    var AjaxLoadMore = {};

    //Set vars
    var page = 0,
    	speed = 300,
    	proceed = false,
        $init = true,
        $loading = true,
        $finished = false,
        $window = $(window),
        $button_text = '',
        $data,
        $el = $('#ajax-load-more'),
        $content = $('div.listing', $el),
        $delay = 150,
        $scroll = true,
		$prefix = '_ajax_load_',
        $path = $content.attr('data-path'),
        $max_pages = $content.attr('data-max-pages'),
        $offset = $content.attr('data-offset'),
        $transition = $content.attr('data-transition');
        
    AjaxLoadMore.init = function () {
        // Bug fix: Prevent loading of unnessasry posts by moving the user to top of page
       // $(window).scrollTop(0);

        // ** EDIT THIS PATH **
        // Path to theme folder 
        if ($path === undefined) {
            $path = './wp-content/themes/caps';
        }
        
        // Max number of pages to load while scrolling 
        if ($max_pages === undefined) {
            $max_pages = 5;
        }
        
        // Max numbe rof pages to load while scrolling 
        if ($transition === undefined) {
            $transition = 'slide';
        } else if ($transition === "fade") {
            $transition = 'fade';
        } else {
            $transition = 'slide';
        }
        
        // Define offset
        if ($content.attr('data-offset') === undefined) {
            $offset = 0;
        } else {
            $offset = $content.attr('data-offset');
        }

        // Define button text
        if ($content.attr('data-button-text') === undefined) {
            $button_text = 'Older Posts';
        } else {
            $button_text = $content.attr('data-button-text');
        }

        // Define on Scroll event
        if ($content.attr('data-scroll') === undefined) {
            $scroll = true;
        } else if ($content.attr('data-scroll') === "false") {
            $scroll = false;
        } else {
            $scroll = true;
        }

        // Add load more button
      $el.append('<div class="load-more-btn-wrap"><button id="load-more" class="more">' + $button_text + '</button></div>');
        var $button = $('#load-more');
        
        //Parse Post Type for multiples
        var $post_type = $content.attr('data-post-type');
        $post_type = $post_type.split(","); 
        
        $('#load-more').text("Loading...");
        // Load posts function
        AjaxLoadMore.loadPosts = function () {
            $button.addClass('loading');

            var data = {
                    'args': $content.attr('data-args'),
                    postType: $post_type,
                    category: $content.attr('data-category'),
                    author: $content.attr('data-author'),
                    taxonomy: $content.attr('data-taxonomy'),
                    tag: $content.attr('data-tag'),
                    search: $content.attr('data-search'),
                    postNotIn: $content.attr('data-post-not-in'),
                    numPosts: $content.attr('data-display-posts'),
                    pageNumber: page,
                    maxPage: $max_pages,
                    offset: $offset,
                    'action': 'ajax_post_action',
                };
            jQuery.post($path, data, function(response) {
               // alert(response);
                $data = $.parseHTML(response); // Convert data to an object
                if(response == '') var action = 0;
                
                    if ($init) {
                        $button.text($button_text);
                        $init = false;
                    }
                    if (action != 0) {
                        var $el = $('<div class="'+$prefix+'reveal"/>');
                        $el.append(response);
                        $el.hide();
                        $content.append($el);
                        
                        
                        if($transition === 'fade'){// Fade transition
                            $el.fadeIn(speed, 'alm_easeInOutQuad', function(){          
                                $loading = false;
                                $button.delay(speed).removeClass('loading');
                                if ($data.length < $content.attr('data-display-posts')) {
                                    $finished = true;
                                    $button.addClass('done');                                    
                                }
                            });
                        }else{// Slide transition
                            $el.slideDown(speed, 'alm_easeInOutQuad', function(){           
                                $loading = false;
                                $button.delay(speed).removeClass('loading');
                                if ($data.length < $content.attr('data-display-posts')) {
                                    $finished = true;
                                    $button.addClass('done');                                   
                                }
                            });
                        }

                     

                    } else {
                        $button.delay(speed).removeClass('loading').addClass('done').text('Loaded');
                        $loading = false;
                        $finished = true;

                    }

                   
            });

           
            
        }

        $button.click(function () {
            if (!$loading && !$finished && !$(this).hasClass('done')) {
                $loading = true;
                page++;
                AjaxLoadMore.loadPosts();
            }
        });

        /*if ($scroll) {
            $window.scroll(function () {
                var content_offset = $button.offset();
                if (!$loading && !$finished && $window.scrollTop() >= Math.round(content_offset.top - ($window.height() - 150)) && page < ($max_pages -1) && proceed) {
                    $loading = true;
                    page++;
                    AjaxLoadMore.loadPosts();
                }
            });
        }*/
        
        AjaxLoadMore.loadPosts();
        
        
        setTimeout(function() { proceed = true }, 1000); //flag to prevent unnecessary loading of post on init.  
    }    
    


    $(window).load(function(){
        //Init Ajax load More    
        if ($("#ajax-load-more").length) {
            //Check if file exists and path is correct
            $.ajax({
                type: 'HEAD',
                data: {'action': 'ajax_post_action'},
                complete: function (e, d) {
                    if (e.status == 404) { // Not found
                        //alert("Could not locate ajax-load-more, please check your file path.");
                        console.log("Could not locate ajax-load-more, please check your file path.");
                    } else { // Found!
                        AjaxLoadMore.init();
                    }
                }
            })
        }
    });

    
    
    //Custom easing function
    $.easing.alm_easeInOutQuad = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}

})(jQuery);