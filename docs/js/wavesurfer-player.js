/*
wavesurfer-player.js 2016
*/

$('.song-menu').dropdown(); //initiate bootstrap dropdown

// Replace .dropdown with .dropup if at the bottom of the scrollable area in .playlist div
function checkHeights() {
  // LOOP through each dropdown
  $('.dropdown,.dropup').each(function(index, element) {
    var $dropDown = $(element),
      $dropDownMenu = $dropDown.find('.dropdown-menu'),
      dropDownTop = $dropDown.offset().top,
      visibleHeight = $dropDown.height(),
      hiddenHeight = $dropDownMenu.height(),
      ddTop = dropDownTop - hiddenHeight,
      ddBottom = dropDownTop + visibleHeight + hiddenHeight;

    // LOOP through all parents
    $dropDown.parents().each(function(ix, el) {
      var $el = $(el);

      // CHECK if any of them have overflow property set
      if ($el.css('overflow') !== 'visible') {
        var limitTop = $el.offset().top,
          limitBottom = limitTop + $el.height();

        // CHECK if parent is better fit when dropped upside
        if (limitBottom < ddBottom && (ddTop - limitTop) > (limitBottom - ddBottom))
          $dropDown.removeClass('dropdown').addClass('dropup');
        else
        	$dropDown.removeClass('dropup').addClass('dropdown');

        // BREAK LOOP
        return false;
      }
    });
  });
}

// Sets playlist height depending on window size.  Keeps audio controls in view when scrolling through playlist
$(document).ready(function() {
  checkHeights();
  $('.playlist').scroll(checkHeights);
  // Adjust playlist height to fit window // Especially handy for mobile
  $('.playlist').height($(window).height() - $('.playlist').offset().top - 25); // 150 = footer height
  // Check whether the playlist is long enough to cause overflow
  if ($(".playlist").prop('scrollHeight') > $(".playlist").height() ) {
      // Do nothing
  }
  else {
      //Reset the height, no overflow needed.
      $('.playlist').height('auto');
  }
});

// Create a WaveSurfer instance
var wavesurfer = Object.create(WaveSurfer);
var ctx = document.createElement('canvas').getContext('2d');
var linGrad = ctx.createLinearGradient(0, 64, 0, 200);
linGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.000)');
linGrad.addColorStop(0.5, 'rgba(183, 183, 183, 1.000)');

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    wavesurfer.init({
        container: '#waveform',
        waveColor: 'rgba(0, 2, 5, 0.25)',
        progressColor: 'rgba(51, 122, 183, 0.35)',
        cursorColor: '#fff',
        normalize: true,
        barWidth: 1
    });
});

///////////////////////
/* Playback Controls */
///////////////////////

var elapsedSeconds = 0;
document.addEventListener('DOMContentLoaded', function () {
    wavesurfer.setVolume(1); //100% volume to start
    var currentTime;
    pageTitle = document.title; //Get the page's current title, will append audio information to it

    var playPause = $('#playPause');
    $('#playPause').click(function() {
        wavesurfer.playPause();
    });

    function getCurrentTrackIndex(currentTitle) {
        //var songIndex = $(songs).find(".song:contains("+currentTitle+")").closest('.song-row').index(); //Use title of currently playing song to find the original index
        //var songIndex = $.inArray(currentTitle, songs);
        //console.log(document.querySelectorAll("[data-title='"+currentTitle+"']"));
        songIndex = Array.from(songs).findIndex(item => item.dataset.title === currentTitle);
        //songIndex = indexes[0]
        return songIndex;
    }

    function shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    // The playlist links
    var titles = $('#playlist div .song');
    var songs = $('#playlist li.song-row');
    var currentTrack = 0;
    var shuffle = false;
    var nextSong = false;
    $('#shuffle').click(function() {
        if (shuffle) {
            shuffle = false;
            songs = $('#playlist li.song-row'); //Reset order of playlist to unshuffle
            nextSong = (getCurrentTrackIndex(currentTitle) + 1); //Set next song in unshuffled playlist
            $(this).css({'color': '#333'});
        }
        else {
            shuffle = true;
            $(this).css({'color': '#3370a7'});
            songs = $('#playlist li.song-row');
            shuffleArray(songs);
        }
    });

    var repeat = false;
    $('#repeat').click(function() {
        if (repeat) {
            repeat = false;
            $(this).css({'color': '#333'});
        }
        else {
            repeat = true;
            $(this).css({'color': '#3370a7'});
        }
    });

    // Displays seconds.miliseconds in 00:00 format
    function getTimeString(totalSeconds) {
        function timeToString(num) {
            return ( num < 10 ? "0" : "" ) + num;
        }

        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds = totalSeconds % 3600;

        var minutes = Math.floor(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;

        var seconds = Math.floor(totalSeconds);

        // Pad the minutes and seconds with leading zeros, if required
        hours = timeToString(hours);
        minutes = timeToString(minutes);
        seconds = timeToString(seconds);

        // Compose the string for display
        var currentTimeString = minutes + ":" + seconds;

        return currentTimeString;
    }

    // Sets the elapsed time for current song
    function updateCurrentTime() {
        elapsedSeconds++;
        $('.current-time').text(getTimeString(elapsedSeconds));
    }

    // Resets the elapsed time for current song
    function clearTimer() {
        clearInterval(currentTime);
        $('.current-time').html('00:00');
        $('.current-song').html('Stopped');
        elapsedSeconds = 0;
    }


    function playNow() {
        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });
    };
    // Toggle play/pause
    wavesurfer.on('play', function () {
        // Switch between play and pause icon in main audio-control class
        $('#play').hide();
        $('#pause').show();

        // Set title to include current song name
        currentTitle = songs[currentTrack].getAttribute('data-title');
        title =  currentTitle + ' \u2013 ' + pageTitle;
        document.title = title;
        // Switch between play and pause icon on current song row
        var currentIcon = $(songs[currentTrack]).find('.play-song');
        $(currentIcon).removeClass('fa-play').addClass('fa-pause');

        if (wavesurfer.isPlaying() == true) {
            clearTimer(); //ensure timer resets to 0
            // Start timer for this song
            elapsedSeconds = wavesurfer.getCurrentTime(); //not sure if this is necessary
            currentTime = setInterval(updateCurrentTime,1000);
            $('.current-song').html('Now Playing: ' + currentTitle);
        }
    });

    // Update time when user seeks
    wavesurfer.on('seek', function () {
        elapsedSeconds = wavesurfer.getCurrentTime();
    });

    wavesurfer.on('pause', function () {
        // Replace play / pause icons
        $('#play').show();
        $('#pause').hide();
        $('.play-song').removeClass('fa-pause').addClass('fa-play');
        clearInterval(currentTime);
    });

    $("#play").click( function() {
        // Play when main audio-control play button is clicked
        playNow();
    });

    // Load a track by index and highlight the corresponding link
    var setCurrentSong = function (index) {
        currentTrack = index;
        wavesurfer.load(songs[currentTrack].getAttribute('data-src'));
    };

    // Click play / pause buttons in playlist
    $('ul#playlist li').click(function() {
        if ($(this).attr('data-src') === songs[currentTrack].getAttribute('data-src')) {
            clearInterval(currentTime); //stop timer at current time
            wavesurfer.playPause(); //Toggle play / pause if clicked on current song
        }
        else {
            var songTitle = this.getAttribute('data-title');
            var songIndex = getCurrentTrackIndex(songTitle);
            setCurrentSong(songIndex);
            playNow();
        }
    });

    // Play / Pause current track with play button in playlist, or play different track
    /*$('.play-song').click(function() {
        event.stopImmediatePropagation();
        if ($(this).closest('li').attr('data-src') === songs[currentTrack].getAttribute('data-src')) {
            // Toggle play / pause if clicked on the song currently loaded
            wavesurfer.playPause();
            clearInterval(currentTime);
        }
        else {
            // Get index of song clicked
            console.log(this);
            var songTitle = $(this).parent().siblings().find('.song').text(); //TODO: Fix for data-title
            var songIndex = getCurrentTrackIndex(songTitle);
            setCurrentSong(songIndex);
            wavesurfer.on('ready', function () {
                wavesurfer.play(); // Play new song when button is clicked
            });
        }
    });*/
    function gotoNextSong(){
        if (!repeat) {
            if (((currentTrack + 1) % songs.length) > 0) {
                if (!nextSong) {
                    setCurrentSong((currentTrack + 1) % songs.length);
                    playNow();
                }
                else {
                    setCurrentSong(nextSong);
                    playNow();
                    nextSong = false;
                }
            }
            else {
                //Do nothing, reached end of playlist
            }
        }
        else {
            if (!nextSong) {
                setCurrentSong((currentTrack + 1) % songs.length);
                playNow();
            }
            else {
                setCurrentSong(nextSong);
                playNow();
                nextSong = false;
            }
        }
    }
    // Go to the next track on finish
    wavesurfer.on('finish', function () {
        gotoNextSong();
    });

    // Go to next track when next button is clicked
    $("#next").click(function() {
        gotoNextSong();
    });

    // Go to previous track when previous button is clicked
    $("#previous").click(function() {
        if (currentTrack > 0) {
            setCurrentSong((currentTrack - 1) % songs.length);
        }
        // Loop back to last song in playlist
        else {
            if (repeat) {
                setCurrentSong(songs.length - 1);
            }
            else {
                //Do nothing, reached end of playlist
            }
        }
    });

    // Stop on click
    $("#stop").click(function() {
        wavesurfer.stop();
        clearTimer();
        $('.play-song').addClass('fa-play').removeClass('fa-pause');
        title = 'Stopped \u2013 ' + pageTitle;
        document.title = title;
    });



    // Load the first track
    setCurrentSong(currentTrack);

});

$('#playlist li .right').click(function() {
    event.stopImmediatePropagation(); //prevents songs from playing when clicking on right menu icon (not an ideal solution but it works)
    event.preventDefault();
});

/////////////////////
/* Volume Controls */
/////////////////////

// Mute function
// Toggle mute on click
$("#mute").click(function() {
    mute();
});
// TODO: Update whenever fontawesome puts out a mute icon instead of volume-off icon.
var percentage = 100;
var muted = false;
function mute() {
    if (muted == false) {
        wavesurfer.toggleMute();
        muted = true;
        oldpercentage = percentage; //remember volume setting for when we unmute
        percentage = 0;
        $('#mute i').removeClass('fa-volume-up').removeClass('fa-volume-down').addClass('fa-volume-off');
        $('.volumeBar').css('width', 0 + '%');
    }
    else {
        wavesurfer.toggleMute();
        muted = false;
        percentage = oldpercentage;
        if ((percentage < 70) && (percentage > 0)) {
            $('#mute i').removeClass('fa-volume-off').removeClass('fa-volume-up').addClass('fa-volume-down');
        } else {
            $('#mute i').removeClass('fa-volume-off').removeClass('fa-volume-down').addClass('fa-volume-up');
        }
        $('.volumeBar').css('width', percentage + '%');
    }
}

// Determines whether the user is click/dragging volume bar (isDown) so it doesn't hide the bar when the mouse leaves the .audio-control.right div.
var isDown = false;
$('.audio-control .right').on('mousedown', function(){
    isDown = true;
}).on('mouseup', function(){
    isDown = false;
});

function showVolume(){
    $('.volume').fadeIn();
    $('.volumeBar').fadeIn();
}

function hideVolume(){
    if (isDown == false) {
        $('.volume').fadeOut();
        $('.volumeBar').fadeOut();
    }
}

// Show volume bar on hover
$('.audio-control .right').hoverIntent(showVolume, hideVolume);

// Prevents volume bar from showing on mobile tap (hopefully) and mutes
$('.audio-control .right').on('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    mute();
});

// Listen for scroll, call to adjust volume up or down
$(function() {
    $('.audio-control .right').bind('wheel DOMMouseScroll', function (event) {
         if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
             scrollVolume(5);
         }
         else {
             scrollVolume(-5);
         }
         return false; // prevent page from scrolling
    });
});

function scrollVolume(amount) {
    percentage = percentage + amount;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    setVolume(percentage);
}

var volumeDrag = false;
$('.volume').on('mousedown', function (e) {
    volumeDrag = true;
    muted = false;
    $('#mute i').removeClass('fa-volume-off').addClass('fa-volume-down');
    updateVolume(e.pageX);
});

$(document).on('mouseup', function (e) {
    if (volumeDrag) {
        volumeDrag = false;
        updateVolume(e.pageX);
    }
});

$(document).on('mousemove', function (e) {
    if (volumeDrag) {
        updateVolume(e.pageX);
    }
});

var updateVolume = function (x, vol) {
    var volume = $('.volume');
    if (vol) {
        percentage = vol * 100;
    } else {
        var position = x - volume.offset().left;
        percentage = 100 * position / volume.width();
    }
    if (percentage > 100) {
        percentage = 100;
    }
    if (percentage < 0) {
        percentage = 0;
    }
    setVolume(percentage);
}

function setVolume(percentage) {
    // Update volume bar css and player volume
    $('.volumeBar').css('width', percentage + '%');
    wavesurfer.setVolume(percentage / 100);

    // Change sound icon based on volume
    if (percentage == 0) {
        $('#mute i').removeClass('fa-volume-up').removeClass('fa-volume-down').addClass('fa-volume-off');
    } else if ((percentage < 70) && (percentage > 0)) {
        $('#mute i').removeClass('fa-volume-off').removeClass('fa-volume-up').addClass('fa-volume-down');
    } else {
        $('#mute i').removeClass('fa-volume-off').removeClass('fa-volume-down').addClass('fa-volume-up');
    }
}
