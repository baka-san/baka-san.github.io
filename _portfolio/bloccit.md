---
layout: post
title: Bloccit (not Reddit)
thumbnail-path: "img/bloccit.png"
short-description: Bloccit - totally not related to Reddit - is a website which allows you to share links and discuss hot topics with random strangers online.
---


{:.center}
![]({{ site.baseurl }}/img/blocflix.png)

Built using Ruby on Rails for backend, Bootstrap for a fully-responsive experience, PostgreSQL for database, and Rspec for all testing, Bloccit provides a simple yet overall satisfying environment for users to discuss a range of topics. While Bloccit may be navigated by guests, for the best experience, an account should be created. This provides the ability to create new posts, comment, upvote and downvote, favorite and follow posts receiving email notifications when another user comments, maintain a profile, as well as a few other features. In this post, we will explore the site page by page.

## Home Page
A user is greeted by Bloccit’s welcome page, allowing a user to sign in or sign up. The welcome page is representative of Bloccit’s design - simple and sexy - allowing users to focus on posting links, upvoting and downvoting, and getting into discussions and debates with other users. The page also boasts the site’s impressive accomplishments such as ending world hunger and poverty minutes after being launched. It also has been shown to make people significantly better looking in the laboratory. Thanks Bloccit.

## Topics Page
The topics page is viewable to any user, though only admin users can create new topics. This was intentional, in order to keep topics focused and prevent redundancy. Each topic is followed by a short description, allowing users to get an idea of what might be discussed.

When a topic is selected, the user is shown a more detailed view of the topic as well as all its associated posts. Posts are sorted by an algorithm based on number of votes and age of the post, keeping the feed fresh, yet populated with popular content.

## Post Page
Posts are also viewable to any user, however only a user who is logged in may comment, vote, or favorite the post. Any user who has favorited a post will receive email notifications via  SendGrid when a new comment is posted. The owner of a post may delete the post, while the owner of a comment may delete their own comments. An admin user can do whatever they want so don’t piss them off, bro.

## User Profile
Getting trolled? Hop on over to their profile page and see what they’ve been up to. User’s with gravatar will have an image displayed along with the number of posts and comments they’ve made. All posts, comments, and favorited posts are also displayed chronologically on every user’s profile. This helps you keep in touch and discuss more with people you like as well as avoid those you don’t like.

## Technical Junk and Security
Don’t want your employer, or worse, your mom to find out what you’ve been doing on Bloccit? No problem, just make your post private. This cool feature hides your post from all guest users, eliminating the threat of a snooping employer or mother. 
Keeping users or anyone else from editing information they shouldn’t is taken seriously here at Bloccit. Private functions were written and used in conjunction with rails methods such as `before_action` to force authorize users and force login before trying to access any private page or update information, such as a user’s post.


