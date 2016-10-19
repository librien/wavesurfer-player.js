

// Adjust playlist height to fit window // Especially handy for mobile
$('.playlist').height($(window).height() - $('.playlist').offset().top - 150 ); // 150 = footer height
// Check whether the playlist is long enough to cause overflow
if ($(".playlist").prop('scrollHeight') > $(".playlist").height() ) {
    // Do nothing
}
else {
    //Reset the height, no overflow needed.
    $('.playlist').height('auto');
}
// Replace .dropdown with .dropup if at the bottom of the scrollable area in .playlist div
$(document).on("shown.bs.dropdown", ".dropdown", function () {
    // calculate the required sizes, spaces
    var $ul = $(this).children(".dropdown-menu");
    var $button = $(this).children(".song-menu");
    var ulOffset = $ul.offset();
    // how much space would be left on the top if the dropdown opened that direction
    var spaceUp = (ulOffset.top - $button.height() - $ul.height()) - $('.playlist').scrollTop();
    // how much space is left at the bottom
    var spaceDown = $('.playlist').scrollTop() + $('.playlist').height() - (ulOffset.top + $ul.height());
    // switch to dropup only if there is no space at the bottom AND there is space at the top, or there isn't either but it would be still better fit
    if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown))
      $(this).addClass("dropup");
}).on("hidden.bs.dropdown", ".dropdown", function() {
    // always reset after close
    $(this).removeClass("dropup");
});
