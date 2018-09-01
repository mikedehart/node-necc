/*
	Script to enable and toggle lightbox for gallery elements
	Courtsey of: http://ashleydw.github.io/lightbox/

	Requires: jQuery (loaded in view via CDN)
*/

$(document).on('click', '[data-toggle="lightbox"]', function(event) {
                event.preventDefault();
                $(this).ekkoLightbox({
                	showArrows: true,
                	wrapping: true
                });
            });