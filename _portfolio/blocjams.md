---
layout: post
class: blocjams
title: BlocJams
thumbnail-path: "img/blocjams/blocjams.gif"
short-description: BlocJams is a Spotify-esque music streaming service, allowing users to listen to all of their favorite albums at the click of a button.
---

{% include figure-center.html url="/img/blocjams/blocjams.png" title="" class="" %}

## Overview

Before starting this project, I spent a good month studying basic JavaScript - variables, arrays, loops, functions, conditionals, and everything else. BlocJams gave me the perfect opportunity to put all of this knowledge to use. This was the first project of Bloc's [Web Development Program](https://www.bloc.io/web-developer-track/syllabus?mkt_tok=eyJpIjoiTjJVeVpXUmlaVGs0WmpFeCIsInQiOiJlVmtWQlRcL202STlXQUVSaVpmWnUrTEo0amJXMmhEZ1wvTE5LYUtmVHBycUY4blhrKzZtMWlTNGZJa2pocDAwb2xsMWE1cUU5eTFxWDZES3pJQWFqS0p1SXMzYTcxcnJic0ZNZnpaSGRVNDhpNExjaUZuYms1ZDloMXZ6OUxzQ1hzIn0%3D). Being the first project in the curriculum and that some students have never studied code before, there was a lot of hand holding going on. I didn't really like that, so I usually looked at the goal of a checkpoint, wrote the code, and then checked with instruction after finishing. Accordingly, my JavaScript code ended up being relatively different than the source code. For example, I think Bloc often favored keeping instruction simple over keeping the code DRY. But don't take my word for it; check out [Bloc's source code](https://github.com/Bloc/bloc-jams-source/blob/master/scripts/album.js) and decide for yourself.

BlocJams is a Spotify-esque music streaming service, allowing users to listen to all of their favorite albums at the click of a button. The code was initially written with JavaScript, and then rewritten in jQuery. This post will discuss the site page by page. The JavaScript source code can be found [here](https://github.com/baka-san/bloc-jams/tree/checkpoint-15-html-css), though conceptually the code is virtually the same, so it will not be included in this post. Also, in order to avoid clutter, non-essential code is <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_1">viewable via modals</a> and will be highlighted as such.

{% include modal.html id="1" type="code" title="path/to/code/hello_world.rb" language="ruby"
body='puts "Hello World!"' %}

The app is deployed on [Heroku](https://bloc-jams-heroku.herokuapp.com/) and the source code is available on [GitHub](https://github.com/baka-san/bloc-jams).



## The Landing Page

{% include figure-left.html url="/img/blocjams/landing-scroll-event.jpg" title="Fig 1: Triggering Animations" class="" %}

{% include figure-left.html url="/img/blocjams/landing-animation.gif" title="Fig 2: The Animation" class="landing-animation" %}

Users are greeted by BlocJams' stylish landing page. As seen in Figure 2, there are three elements which come into view as the user scrolls down the page. This effect was achieved using css <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_2">transforms and transitions</a>. The elements are initially not visible due to the opacity being set to zero. The window is watched and when the user has scrolled far enough down the page (see Figure 1), a JavaScript function called <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_3">animatePoints</a> is called, changing the opacity to 1 and animating the elements.

{% include modal.html id="2" type="code" title="styles/landing.css" language="css" file="code/blocjams/landing-transforms-transitions.css" %}

{% include modal.html id="3" type="code" title="scripts/landing.js" language="javascript" file="code/blocjams/landing-jquery.js" %}  



## The Music Library

{% include figure-left.html url="/img/blocjams/music-library.png" title="Fig 3: Music Library" class="" %}

The music library isn't anything special in its present state. The idea is that users would see their music and be able to filter by options such as artist, album, and song title. There would also be an option to upload or sync music. As this project was focused on playing music and using JavaScript to animate the playbar, this aspect was left out. Instead, a default album called *The Colors* is tiled repeatedly using JavaScript to fill up the library.




## The Album View

So a user clicks a song and it plays...sounds pretty simple, right? WRONG! There is so much JavaScript magic going on behind the scenes to make a song play and the view update correctly. The album page is by far the coolest part of BlocJams. The entire JavaScript file for the album view can be viewed <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_4">here</a>. The code will be discussed step by step, but please use this file as a reference, as not all functions are explicitly discussed in the following analysis.

{% include modal.html id="4" type="code" title="scripts/album-refactored.js" language="javascript" file="code/blocjams/album-refactored.js" %}

- When the page loads, <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_5">setCurrentAlbum</a> sets the correct album information to the page. The album information is stored in <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_6">fixtures.js</a>.

{% include modal.html id="5" type="code"  title="setCurrentAlbum" language="javascript" file="code/blocjams/set-current-album.js" %}

{% include modal.html id="6" type="code"  title="scripts/fixtures.js" language="javascript" file="code/blocjams/fixtures.js" %}

- When a song is hovered with the mouse, <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_7">onHover</a> removes the track number and displays a play button if the hovered song is not currently playing. If the song is playing, nothing should change. A similar function, <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_8">offHover</a>, is called when the mouse leaves the song row. This function removes the play button and replaces it with the song number if the song is not currently playing. Again, nothing should change when the song is playing. For both of these functions, if a song is paused, the play button should remain visible so a user can resume the track.

{% include figure-center.html url="/img/blocjams/album-on-hover.gif" title="" class="indent-item-in-list" %}

{% include modal.html id="7" type="code"  title="onHover" language="javascript" file="code/blocjams/on-hover.js" %}

{% include modal.html id="8" type="code"  title="offHover" language="javascript" file="code/blocjams/off-hover.js" %}

- When a user clicks a song, the function <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_9">clickHandler</a> is called. There three distinct cases to handle:
1. If no song is currently playing, the function sets the volume, <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_10">sets the volume bar</a> in the playbar to the correct position, and calls the function <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_11">playSong</a>. playSong is in charge of many functions including updating the HTML, the playbar information, the audio file, and the <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_12">seekbar</a>.
2. If there is a song playing, the song is either <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_11">played</a> or <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_13">paused</a>. Keeping DRY code in mind, these functions are reused any time a song is played or paused throughout the site.
3. If the clicked song is a new song, the process is very similar to situation 1. However, a few steps are different, such as having to stop the currently playing audio file.

{% include modal.html id="9" type="code"  title="clickHandler" language="javascript" file="code/blocjams/click-handler.js" %}
{% include modal.html id="10" type="code"  title="setVolume" language="javascript" file="code/blocjams/set-volume.js" %}
{% include modal.html id="11" type="code"  title="playSong" language="javascript" file="code/blocjams/play-song.js" %}
{% include modal.html id="12" type="code"  title="updateSeekBarWhileSongPlays" language="javascript" file="code/blocjams/update-seek-bar-while-song-plays.js" %}
{% include modal.html id="13" type="code"  title="pauseSong" language="javascript" file="code/blocjams/pause-song.js" %}

- When the next or previous buttons on the playbar are clicked, <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_14">nextPrevSong</a> is called. To keep the code DRY, this function handles both the next and previous buttons. The great part about this function (and why it's so much better than <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_15">Bloc's original code</a>) is that it triggers a click on the album's play button, thus calling the function <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_9">clickHandler</a> already discussed above. This one line of code makes it so we can reuse all of the code we've already written rather than rewriting `stop(current_song)`, `play(next_song)`, etc. like we did before. Pretty cool.

{% include modal.html id="14" type="code"  title="nextPrevSong" language="javascript" file="code/blocjams/next-prev-song.js" %}
{% include modal.html id="15" type="code"  title="That Ain't Very DRY..." language="javascript" file="code/blocjams/bloc-next-previous-song.js" %}

- Lastly, as the song plays, the seekbar needs to be updated, as well as the track's current time. If a user clicks or drags the seekbar, the audio track and HTML should both be updated. This was achieved using the function <a href="#" class="modal-anchor" data-toggle="modal" data-target="#modal_target_16">setupSeekBars</a>. Simply put, for click events, the x position of both the click event and the playbar are used to calculate the percentage of the song that should be skipped. For drag events, where the user holds down the mouse and drags the seekbar to a new position, the seekbar's thumb is bound to the window on click and unbound when the mouse is released. The process for calculating the new track position is similar to what was described above for a click event.

{% include figure-center.html url="/img/blocjams/album-seekbars.gif" title="" class="indent-item-in-list" %}
{% include modal.html id="16" type="code"  title="setupSeekBars" language="javascript" file="code/blocjams/setup-seek-bars.js" %}

There is some other clever logic (such as playing the first song if the play button is clicked in the playbar but no song has been selected) which wasn't discussed here, so please make sure to check out the full code on [GitHub](https://github.com/baka-san/bloc-jams).

## Concluding Remarks

While Not Wikipedia employs a lot of great code, there was still so much I wanted to address. Here's a list of a few things off the top of my head:

BlocJams has an overall decent UX. A user can play music and utilize many common features found in a music player. However, there are still many features which could be added to make the BlocJams UX better. 
Here are a few things:

- Add player options such as repeat one and repeat all.
- Use Rails to create a users model.
- Give users the ability to upload/sync music.
- Give users the ability to sort by artist and song title in the album view.
- Give users the ability to make playlists, rate songs, and all the other normal functionality.
- Fix up a few random bugs in the functionality of the playbar.
- Use more mobile friendly touch options for the playbar.


## Configuration

**BlocJams**: [GitHub](https://github.com/baka-san/bloc-jams) / [Live Site](https://blocjams-heroku.herokuapp.com/)

**Languages and Libraries**: HTML, CSS, JavaScript, jQuery, [Buzz!Library](https://buzz.jaysalvat.com/)

**To run locally:**
- [Visit BlocJams's GitHub](https://github.com/baka-san/not-wikipedia)
- [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
- Open `index.html` with your favorite browser



## Who Invited Angular To The Party?

That's right, Angular showed up to the party and things are getting pretty crazy. I'm not gonna lie - I was a little sad to throw out all of my code in order to do it again with Angular, but the benefits made it well worth it. Who needs Angular anyways? Well, for starters Angular is lightning fast. It's a [single-page application](https://en.wikipedia.org/wiki/Single-page_application) (SPA) which basically page loads are not required when navigating to different pages. This is ideal for BlocJams, as not reloading the page allows music to continue playing even when a user navigates away from the album view (a feature not included in the JavaScript versions). Another great thing is Angular's [two-way data binding](https://docs.angularjs.org/guide/databinding) which allows data to be updated in real time whenever a user makes changes.

Anyways, checkout the code on [GitHub](https://github.com/baka-san/bloc-jams-angular).