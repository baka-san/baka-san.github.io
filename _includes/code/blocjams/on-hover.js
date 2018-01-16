var onHover = function(event) {
  var songItem = $(this).find('.song-item-number');
  var songNumber = parseInt(songItem.attr('data-song-number'));

  // Display play button on mouseover/mouseleave IF NOT playing
  if (songNumber !== currentlyPlayingSongNumber) {

    // Change to play button on mouseover
    songItem.html(playButtonTemplate);
  }
};