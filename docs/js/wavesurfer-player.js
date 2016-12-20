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

  var playPause = document.getElementById('play-pause');
  playPause.addEventListener('click', function() {
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

  var songNodeList = document.querySelectorAll('.song-row');
  var songs = [];

  // Convert nodeList to array
  function nodetoArray(nodeList, nodeArray) {
    for (var i = 0; i < nodeList.length; ++i) {
      nodeArray[i] = nodeList[i];
    }
    return nodeArray;
  }

  songs = nodetoArray(songNodeList, songs);

  var currentTrack = 0;
  var nextSong = false;
  var isShuffle = false;
  document.getElementById('shuffle').addEventListener('click', function() {
    if (isShuffle) {
      isShuffle = false;

      //Reset order of playlist to unshuffle
      songs = nodetoArray(songNodeList, songs);

      //Set next song in unshuffled playlist
      nextSong = (getCurrentTrackIndex(currentTitle) + 1);
      this.style.color = '#333';
    }
    else {
      isShuffle = true;
      this.style.color = '#3370a7';
      shuffle(songs);
    }
  });

  var isRepeat = false;
  document.getElementById('repeat').addEventListener('click', function() {
    if (isRepeat) {
      isRepeat = false;
      this.style.color = '#333';
    }
    else {
      isRepeat = true;
      this.style.color = '#3370a7';
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
    document.getElementById('current-time').textContent = getTimeString(elapsedSeconds) + ' / ' + currentSongLength;
  }

  // Resets the elapsed time for current song
  function clearTimer() {
    clearInterval(currentTime);
    document.getElementById('current-time').textContent = '00:00';
    document.getElementById('current-song').textContent = 'Stopped';
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
    document.getElementById('play').style.display = 'none';
    document.getElementById('pause').style.display = '';
    // Set title to include current song name
    currentTitle = songs[currentTrack].getAttribute('data-title');
    currentSongLength = getTimeString(songs[currentTrack].getAttribute('data-length'));
    title =  currentTitle + ' \u2013 ' + pageTitle;
    document.title = title;

    // Switch between play and pause icon on current song row
    var currentIcon = songs[currentTrack].querySelector('.play-song');

    currentIcon.classList.add('fa-pause');
    currentIcon.classList.remove('fa-play');

    if (wavesurfer.isPlaying() == true) {

      // Ensure timer resets to 0
      clearTimer();

      // Start timer for this song
      elapsedSeconds = wavesurfer.getCurrentTime();
      currentTime = setInterval(updateCurrentTime,1000);
      document.getElementById('current-song').textContent = ('Now Playing: ' + currentTitle);
    }
  });

  // Update time when user clicks on wavesurfer waveform
  wavesurfer.on('seek', function () {
    elapsedSeconds = wavesurfer.getCurrentTime();
  });

  wavesurfer.on('pause', function () {

    // Replace play / pause icons
    document.getElementById('play').style.display = '';
    document.getElementById('pause').style.display = 'none';

    var songButtons = document.querySelectorAll('.play-song'),
      i;
    for (i = 0; i < songButtons.length; i++) {
      songButtons[i].classList.remove('fa-pause');
      songButtons[i].classList.add('fa-play');
    }
    clearInterval(currentTime);
  });

  document.getElementById('play').addEventListener('click', function() {
    playNow();
  });

  // Load a track by index and highlight the corresponding link
  var setCurrentSong = function (index) {
    currentTrack = index;
    wavesurfer.load(songs[currentTrack].getAttribute('data-src'));
  };
  // Plays a track when clicked in the playlist, pauses if user clicks on currently playing track
  for (var i = 0; i < songs.length; i++) {
    songs[i].addEventListener('click', function(event) {

      if (this.getAttribute('data-src') === songs[currentTrack].getAttribute('data-src')) {

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
  }

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
  document.getElementById('next').addEventListener('click', function() {
    gotoNextSong();
  });

  // Go to previous track when previous button is clicked
  document.getElementById('previous').addEventListener('click', function() {
    if (elapsedSeconds < 2) {
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
  document.getElementById('stop').addEventListener('click', function() {
    wavesurfer.stop();
    clearTimer();
    document.querySelectorAll('.play-song')[currentTrack].classList.remove('fa-pause');
    document.querySelectorAll('.play-song')[currentTrack].classList.add('fa-play');
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
var volumeBar = document.querySelector('.volume-bar');
var muted = false;
var muteIcon = document.querySelector('#mute i');
function mute() {
  if (muted == false) {
    wavesurfer.toggleMute();
    muted = true;

    // Remember volume setting for when we unmute
    oldpercentage = percentage;

    percentage = 0;
    muteIcon.classList.remove('fa-volume-up');
    muteIcon.classList.remove('fa-volume-down');
    muteIcon.classList.add('fa-volume-off');
    document.querySelector('.volume-bar').style.width = 0 + '%';
  }
  else {
    wavesurfer.toggleMute();
    muted = false;
    percentage = oldpercentage;

    if ((percentage < 70) && (percentage > 0)) {
      muteIcon.classList.remove('fa-volume-up');
      muteIcon.classList.remove('fa-volume-off');
      muteIcon.classList.add('fa-volume-down');
    } else {
      muteIcon.classList.remove('fa-volume-off');
      muteIcon.classList.remove('fa-volume-down');
      muteIcon.classList.add('fa-volume-up');
    }
    document.querySelector('.volume-bar').style.width = percentage + '%';
  }
}

// Toggle mute on click
document.getElementById('mute').addEventListener('click', function() {
  mute();
});

var volumeControl = document.getElementById('volume-control');
// Prevents volume bar from hiding itself (on mouseout) if user is actively click/dragging volume bar.
var isDown = false;

volumeControl.addEventListener('mousedown', function() {
  isDown = true;
});
volumeControl.addEventListener('mouseup', function() {
  isDown = false;
});

function showVolume(){
  document.querySelector('.volume').style.opacity = 1;
}

function hideVolume(){
  if (isDown == false) {
    document.querySelector('.volume').style.opacity = 0;
  }
}

// Show volume bar on hover
volumeControl.addEventListener('mouseover', showVolume);
volumeControl.addEventListener('mouseout', hideVolume);

// Prevents volume bar from showing on mobile tap (hopefully) and mutes
volumeControl.addEventListener('touchstart', function(e) {
  e.preventDefault();
  e.stopPropagation();
  mute();
});

// Listen for scroll, call to adjust volume up or down
if (volumeControl.addEventListener) {
	// IE9, Chrome, Safari, Opera
	volumeControl.addEventListener("mousewheel", MouseWheelHandler, false);
	// Firefox
	volumeControl.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}
// IE 6/7/8
else volumeControl.attachEvent("onmousewheel", MouseWheelHandler);
function MouseWheelHandler(e) {
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  if (delta > 0 /*|| e.detail < 0*/) {
    scrollVolume(5);
  }
  else {
    scrollVolume(-5);
  }

  // Prevent page from scrolling when controlling volume bar by mouse wheel
  e.preventDefault();
}

function scrollVolume(amount) {
  percentage = percentage + amount;
  if (percentage > 100) percentage = 100;
  if (percentage < 0) percentage = 0;
  setVolume(percentage);
}

var volumeDrag = false;

document.querySelector('.volume').addEventListener('mousedown', function (e) {
  volumeDrag = true;
  muted = false;
  updateVolume(e.pageX);
});

document.addEventListener('mouseup', function(e) {
  if (volumeDrag) {
    volumeDrag = false;
    updateVolume(e.pageX);
  }
});

document.addEventListener('mousemove', function(e) {
  if (volumeDrag) {
    updateVolume(e.pageX);
  }
});

var updateVolume = function (x, vol) {
  var volume = document.querySelector('.volume');
  if (vol) {
    percentage = vol * 100;
  } else {
    var rect = volume.getBoundingClientRect();
    var offsetLeft = rect.left + document.body.scrollLeft;
    var position = x - offsetLeft;
    width = parseInt(window.getComputedStyle(volume).getPropertyValue('width'),10);
    percentage = 100 * position / width;
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
  volumeBar.style.width = percentage + '%';
  wavesurfer.setVolume(percentage / 100);

  // Change sound icon based on volume
  if (percentage == 0) {
    muteIcon.classList.remove('fa-volume-up');
    muteIcon.classList.remove('fa-volume-down');
    muteIcon.classList.add('fa-volume-off');
  } else if ((percentage < 70) && (percentage > 0)) {
    muteIcon.classList.remove('fa-volume-up');
    muteIcon.classList.remove('fa-volume-off');
    muteIcon.classList.add('fa-volume-down');
  } else {
    muteIcon.classList.remove('fa-volume-down');
    muteIcon.classList.remove('fa-volume-off');
    muteIcon.classList.add('fa-volume-up');
  }
}
