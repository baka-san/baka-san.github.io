var offHover = function(event) {
  var songItem = $(this).find('.song-item-number');
  var songNumber = parseInt(songItem.attr('data-song-number'));

  if (songNumber !== currentlyPlayingSongNumber) {
    songItem.html(songNumber);
  }
};