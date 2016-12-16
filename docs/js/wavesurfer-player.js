/**
* wavesurfer-player.js 2016
*/

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

/**
* Playback Controls
*/

var elapsedSeconds = 0;
document.addEventListener('DOMContentLoaded', function () {

  // 100% volume to start
  wavesurfer.setVolume(1);

  var currentTime;

  // Get the page's current title, will append audio information to it
  pageTitle = document.title;

  var playPause = $('#playPause');
  playPause.click(function() {
    wavesurfer.playPause();
  });

  // Pause / resume playback with spacebar
  window.onkeydown = function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
        wavesurfer.playPause();
        e.preventDefault();
        return false;
    }
};

  function getCurrentTrackIndex(currentTitle) {
    songIndex = Array.from(songs).findIndex(item => item.dataset.title === currentTitle);
    return songIndex;
  }

  function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  var songs = $('#playlist li.song-row');
  var currentTrack = 0;
  var isShuffle = false;
  var nextSong = false;
  $('#shuffle').click(function() {
    if (isShuffle) {
      isShuffle = false;

      //Reset order of playlist to unshuffle
      songs = $('#playlist li.song-row');

      //Set next song in unshuffled playlist
      nextSong = (getCurrentTrackIndex(currentTitle) + 1);

      $(this).css({'color': '#333'});
    }
    else {
      isShuffle = true;
      $(this).css({'color': '#3370a7'});
      songs = $('#playlist li.song-row');
      shuffle(songs);
    }
  });

  var isRepeat = false;
  $('#repeat').click(function() {
    if (isRepeat) {
      isRepeat = false;
      $(this).css({'color': '#333'});
    }
    else {
      isRepeat = true;
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

      // Ensure timer resets to 0
      clearTimer();

      // Start timer for this song
      elapsedSeconds = wavesurfer.getCurrentTime();
      currentTime = setInterval(updateCurrentTime,1000);
      $('.current-song').html('Now Playing: ' + currentTitle);
    }
  });

  // Update time when user clicks on wavesurfer waveform
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

  $("#play").click(function() {
    playNow();
  });

  // Load a track by index and highlight the corresponding link
  var setCurrentSong = function (index) {
    currentTrack = index;
    wavesurfer.load(songs[currentTrack].getAttribute('data-src'));
  };

  // Plays a track when clicked in the playlist, pauses if user clicks on currently playing track
  $('ul#playlist li').click(function() {
    if ($(this).attr('data-src') === songs[currentTrack].getAttribute('data-src')) {

      // Stop timer at current time
      clearInterval(currentTime);

      //Toggle play / pause if clicked on current song
      wavesurfer.playPause();
    }
    else {
      var songTitle = this.getAttribute('data-title');
      var songIndex = getCurrentTrackIndex(songTitle);
      setCurrentSong(songIndex);
      playNow();
    }
  });

  function gotoNextSong(){
    if (!isRepeat) {
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
        // Do nothing, reached end of playlist
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
    if (elapsedSeconds < 1) {
      if (currentTrack > 0) {
        setCurrentSong((currentTrack - 1) % songs.length);
      }

      // Loop back to last song in playlist
      else {
        if (isRepeat) {
          setCurrentSong(songs.length - 1);
        }
        else {
          // Do nothing, reached end of playlist
        }
      }
    }
    else setCurrentSong(currentTrack);
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

/**
* Volume Controls
*/

// TODO: Update whenever fontawesome puts out a mute icon instead of volume-off icon.
var percentage = 100;
var muted = false;

function mute() {
  if (muted == false) {
    wavesurfer.toggleMute();
    muted = true;

    // Remember volume setting for when we unmute
    oldpercentage = percentage;

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

// Toggle mute on click
$("#mute").click(function() {
  mute();
});

// Prevents volume bar from hiding itself (on mouseout) if user is actively click/dragging volume bar.
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
$('.audio-control .right').hover(showVolume, hideVolume);

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

     // Prevent page from scrolling when controlling volume bar by mouse wheel
     return false;
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
