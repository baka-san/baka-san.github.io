---
layout: post
class: blocjams
title: BlocJams
thumbnail-path: "img/blocjams.png"
short-description: BlocJams is a Spotify-esque music streaming service, allowing users to listen to all of their favorite albums at the click of a button.
---


{:.center}
![]({{ site.baseurl }}/img/blocflix.png)

## Overview
BlocJams was the first project of Bloc's [Web Development Program](https://www.bloc.io/web-developer-track/syllabus?mkt_tok=eyJpIjoiTjJVeVpXUmlaVGs0WmpFeCIsInQiOiJlVmtWQlRcL202STlXQUVSaVpmWnUrTEo0amJXMmhEZ1wvTE5LYUtmVHBycUY4blhrKzZtMWlTNGZJa2pocDAwb2xsMWE1cUU5eTFxWDZES3pJQWFqS0p1SXMzYTcxcnJic0ZNZnpaSGRVNDhpNExjaUZuYms1ZDloMXZ6OUxzQ1hzIn0%3D). Before starting this project, I spent a good month studying basic JavaScript - variables, arrays, loops, functions, conditionals, and everything else. BlocJams gave me the perfect opportunity to put all of this knowledge to use. Essentially, BlocJams is a Spotify-esque music streaming service, allowing users to listen to all of their favorite albums at the click of a button. The code was initially written with JavaScript, which was then rewritten in jQuery. After that, I scrapped all of my precious code again and rewrote the site using Angular. This post will discuss the site page by page, first focusing on the jQuery version of the site and then after discussing the Angular version. The JavaScript source code can be found [here](), though conceptually the code is virtually the same, so it will not be included in this post. 

[??] have a target passed in. clicking the funciton loads it into the code area and changes the code to visible. Pushing the x hides the code and the element. Clicking new code clears the old code and loads in this code. Or just do a modal.

## JavaScript and jQuery

### Landing Page
{% include image.html url="/img/blocjams/.png" title="Fig 1: " class="" %}

{% include image.html url="/img/blocjams/.png" title="Fig 2: " class="" %}

Users are greeted by BlocJams' stylish landing page. As seen in Figure 1, there are three elements which come into view as the user scrolls down the page. This effect was achieved using css transforms and transitions[??]. The elements are initially not visible due to the opacity being set to zero. The window is watched and when the user has scrolled far enough down the page (see Figure 2), a jQuery function called animatePoints[??] is called, changing the opacity to 1 and animating the elements.


### Music Library
{% include image.html url="/img/blocjams/.png" title="Fig 3: " class="" %}

The music library isn't anything special in it's current form. The idea is that that users would see their music and be able to filter by options such as artist, album, and song title. There would also be an option to upload or sync music. As this project is focused more on the aspect of playing music and using jQuery to animate the playbar, this aspect was left out. Instead, a default album called *The Colors* is tiled repeatedly using jQuery to fill up the library.


## Album View

So a user clicks a song and it plays...sounds pretty simple, right? WRONG! There is so much jQuery magic going on behind the scenes to make song play and the view update correctly. The album view is by far the coolest part of BlocJams. Let's overview some of the features:

- When the page loads, setCurrentAlbum[??] sets the page specific html using the album object provided, which is defined in `fixtures.js`.

- 

## Discuss
- Landing Page  
  -css transitions + animations https://www.bloc.io/users/grant-backes/checkpoints/2081?section_id=159
  -event listener + target https://www.bloc.io/users/grant-backes/checkpoints/2082?section_id=159

- Collection View
  -Build JavaScript Templates with a String. Could use the same function with real albums and pass in variables. https://www.bloc.io/users/grant-backes/checkpoints/2083?section_id=159 

- Album View
  - Fixtures https://www.bloc.io/users/grant-backes/checkpoints/2084?section_id=159
  just go through the whole page step by step. Set code to hide or reveal on click of function name.





## Concluding Remarks
- Give users the ability to sort by artist and song title.
- Use Rails to create a users model. 
- Give users the ability to upload/sync music.
- Give users the ability to make playlists, rate songs, and all the other normal functionality.
- Fix up a few random bugs in the functionality of the playbar.
- Use more mobile friendly touch options for the playbar.



Give an example of changing javascript to jquery.

Being that BlocJams was the first project in the curriculum and that some students have never studied code before, there was a lot of hand holding going on. I didn't really like this, so I usually looked at the goal of a checkpoint, wrote the code, and then checked with instruction after. Thus, my JavaScript code ended up being quite different than the source code. I found this style of learning to be more challenging, but overall more useful. 



## Explanation
In the era of music streaming, there are a multitude of streaming services to choose from: Spotify, Pandora, Apple Music, SoundCloud, Google Play Music, and so on. While there are many benefits to streaming music, some people may not have the streaming capabilities or just want to enjoy listening to their own music library. Enter BlocJams. 

## Problem
BlocJams was designed with simplicity in mind. Within minutes, the user can download the app and begin listening to their favorite music -- no login required. 


