var nextPrevSong = function() {

  // Check if a song is playing
  if (currentSoundFile) {

    // Find current song's index
    var incSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);

    // Check if it's the next button
    if ($(this).hasClass('next')) {
      incSongIndex++;

      // Check if it's the last song
      if (incSongIndex >= currentAlbum.songs.length) {
        incSongIndex = 0;
      }
    }

    // Else it's the previous button
    else {
      incSongIndex--;

      // Check if it's the first song
      if (incSongIndex < 0) {
        incSongIndex = currentAlbum.songs.length - 1;
      }
    }

    // Find the next/prev song's element
    var incSongElement = getSongNumberCell(incSongIndex + 1);

    // Simulate a click on the selected element in the song table
    incSongElement.trigger('click');
  }
};