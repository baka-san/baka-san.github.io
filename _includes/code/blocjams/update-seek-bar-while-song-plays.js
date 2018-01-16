var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
      
    currentSoundFile.bind('timeupdate', function(event) {
      // Current time in player
      var currentTime = this.getTime();
      var seekBarFillRatio = currentTime / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');

      updateSeekPercentage($seekBar, seekBarFillRatio);

      // Update current time in the player bar
      setCurrentTimeInPlayerBar(currentTime);
    });
  }
};