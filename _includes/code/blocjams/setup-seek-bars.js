var setupSeekBars = function() {
  // Find both volume / audio control seekbars
  var $seekBars = $('.player-bar .seek-bar');

  // Move the thumb when the bar is clicked
  $seekBars.click(function(event) {
    // event.pageX = offset of click from page left
    // $(this).offset().left = offset of bar from page left
    // offsetX = amount the playbar moved
    // barWidth = total width of playbar
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    
    // Find ratio seekbar changed
    var seekBarFillRatio = offsetX / barWidth;
    
    // Change the currentSoundFile's position
    if ($(this).parent().attr('class') == 'seek-control') {
      //seek(seekBarFillRatio * currentSongFromAlbum.duration);
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    }
    else {
      setVolume(seekBarFillRatio * 100);
    }

    // Actually update the position of the thumb
    updateSeekPercentage($(this), seekBarFillRatio);
  });

  // Allow user to drag the thumb 
  $seekBars.find('.thumb').mousedown(function(event) {
    // Find the seekbar
    var $seekBar = $(this).parent();

    // Make thumb move on drag
    $(document).bind('mousemove.thumb', function(event){
      // event.pageX = offset of click from page left
      // $(this).offset().left = offset of bar from page left
      // offsetX = amount the playbar moved
      // barWidth = total width of playbar
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      
      // Find ratio seekbar changed
      var seekBarFillRatio = offsetX / barWidth;
    
      // Change the currentSoundFile's position
      if ($seekBar.parent().attr('class') == 'seek-control') {
        //seek(seekBarFillRatio * currentSongFromAlbum.duration);
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      }
      else {
        setVolume(seekBarFillRatio);
      }

      // Actually update the position of the thumb
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    // Make thumb stop moving when unclicked
    $(document).bind('mouseup.thumb', function() {
        $(document).unbind('mousemove.thumb');
        $(document).unbind('mouseup.thumb');
    });
  });
};