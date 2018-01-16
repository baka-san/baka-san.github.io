var clickHandler =  function() {

  var songNumber = parseInt($(this).attr('data-song-number'));

  // No song is playing, start playing new
  if (currentlyPlayingSongNumber === null) {

    // Set the initial volume
    setVolume(currentVolume);

    // Set the seek bar position to current
    var volumeRatio = currentVolume/100;
    updateSeekPercentage($('.player-bar .volume'), volumeRatio);

    // Play the song!
    playSong($(this));
  } 

  // Play or pause the current song
  else if (currentlyPlayingSongNumber === songNumber) {

    // Current song is paused, play it
    if (currentSoundFile.isPaused()) {
      playSong($(this));
    } 
    // Current song is playing, pause it
    else {
      pauseSong($(this));
    }
  } 

  // Change to a new song
  else if (currentlyPlayingSongNumber !== songNumber) {
    // change play/pause button back to song number
      var currentSongElement = getSongNumberCell(currentlyPlayingSongNumber);
      currentSongElement.html(currentSongElement.attr('data-song-number'));

      // Stop the current song
      currentSoundFile.stop();

      // Start playing a new song
      playSong($(this));
  } 
};