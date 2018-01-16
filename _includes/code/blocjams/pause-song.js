var pauseSong = function(clicked) {
  
  // change the pause/play button to play
  clicked.html(playButtonTemplate);

  // change player bar play button to play
  $('.play-pause > span').attr('class', 'ion-play');

  // Set the audio file to pause
  currentSoundFile.pause();
};