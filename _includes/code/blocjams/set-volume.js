var setVolume = function(volume) {
  if(currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }

  // If user changes the volume before a song is selected
  else {
    currentVolume = volume;
  }
};