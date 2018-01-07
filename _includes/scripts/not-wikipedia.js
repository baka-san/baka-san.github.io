var ready = function() {
  // Toggle sidebar on button click
  $("#menuToggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
  });

  // Toggle sidebar on window load for larger screens
  if ($(window).width() > 768) {
    $("#wrapper").addClass("toggled");
  }

  
  // Allow transition effects after page loads
  $(window).load(function() {
    $("body").removeClass("preload");
  });


};

$(document).ready(ready)