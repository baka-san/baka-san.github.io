var playSong = function(clicked) {

  // Change the pause/play button to pause
  clicked.html(pauseButtonTemplate);

  // Update song variable info if new song
  if (currentlyPlayingSongNumber !== songNumber) {
    // Update song variable info
    setSong(songNumber);
  }

  // Set the audio file to play
  currentSoundFile.play();

  // update player bar song name
  updatePlayerBarSong();

  // change player bar play button to pause
  $('.play-pause > span').attr('class', 'ion-pause')

  // Make the seek bar stay updated as song plays
  updateSeekBarWhileSongPlays();
};