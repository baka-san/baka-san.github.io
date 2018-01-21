---
layout: post
class: not-reddit
title: Not Reddit
thumbnail-path: "img/not-reddit/home1.png"
short-description: A place where you can share links and discuss rad topics with neckbeards.
---

{% include figure-center.html url="/img/not-reddit/home.png" title="" class="" %}

## Overview
Built using Ruby on Rails for backend, Bootstrap for a fully-responsive experience, PostgreSQL for database, and Rspec for all testing, Not Reddit provides a simple yet overall satisfying environment for users to discuss a range of topics. While Not Reddit may be navigated by guests, for the best experience, an account should be created. This provides the ability to create new posts, comment, upvote and downvote, favorite and follow posts receiving email notifications when another user comments, maintain a profile, as well as a few other features. In this post, we will explore the site page by page.

The app is deployed on [Heroku](https://not-reddit-heroku.herokuapp.com/) and the source code is available on [GitHub](https://github.com/baka-san/not-reddit).

### Features
- Guests can browse the site, except for private topics.
- Guests are not allowed to change or delete anything.
- Users can sign up for a free account.
- Users can sign in and out.
- Users can view topics and posts.
- Users can comment on posts.
- Users can create new posts and edit posts they own.
- Users can up/down vote any post.
- Users can favorite any post.
- Users can be emailed with updates about posts they've favorited.
- A user's profile displays their posts and comments.
- Users can add a Gravatar to their profile.
- A special user called admin is available.
- Admins can delete or edit any topic or post.
- The development database is seeded automatically with users, topics and posts.


## Home Page

<!-- <div class="col col-sm-6 pull-left" markdown="1">
  <img markdown="1" src="{{ site.baseurl }}/img/not-reddit/home-mobile.gif" class="img-fluid" alt="Responsive image">
</div> -->

<!-- <div class="col col-sm-6" markdown="1"> -->
A user is greeted by Not Reddit’s welcome page, allowing a user to sign in or sign up. The welcome page is representative of Not Reddit’s design - [simple yet powerful](https://conversionxl.com/blog/why-simple-websites-are-scientifically-better/) - allowing users to focus on posting links, upvoting and downvoting, and getting into discussions and debates with other users. The page also boasts the site’s impressive accomplishments such as ending world hunger and poverty minutes after being launched. It also has been shown to make people significantly better looking in the laboratory. Thanks Not Reddit.
<!-- </div> -->

## Topics Page

{% include figure-center.html url="/img/not-reddit/topics-index.png" title="" class="" %}

The topics page is viewable to any user, though only admin users can create new topics. This was intentional, in order to keep topics focused and prevent redundancy. Each topic is followed by a short description, allowing users to get an idea of what might be discussed.

{% include figure-center.html url="/img/not-reddit/topics-show.png" title="" class="" %}

When a topic is selected, the user is shown a more detailed view of the topic as well as all its associated posts. Posts are sorted by an algorithm based on number of votes and age of the post, keeping the feed fresh, yet populated with popular content.

## Posts Page

{% include figure-center.html url="/img/not-reddit/posts-show.png" title="" class="" %}

Posts are also viewable to any user, however only a user who is logged in may comment, vote, or favorite the post. Any user who has favorited a post will receive email notifications via  SendGrid when a new comment is posted. The owner of a post may delete the post, while the owner of a comment may delete their own comments. An admin can do whatever they want so don’t piss them off, bro.

## User Profile

{% include figure-center.html url="/img/not-reddit/profile.png" title="" class="" %}

Gettin trolled? Hop on over to their profile page to see what they’ve been up to. User’s with gravatar will have an image displayed along with the number of posts and comments they’ve made. All posts, comments, and favorited posts are also displayed chronologically on every user’s profile. This helps users stay in touch and discuss more with similar-minded people (as well as avoid those they don’t like).

## Privacy, Security, and Technical Junk

*Private Topics*  
Don’t want your employer (or your mom) to find out what you’ve been doing on Not Reddit? No problem, just make a your topic private. This cool feature hides the topic from all guest users, eliminating the threat of an employer or your mother stumbling on your discussion. Piece of cake.

*Thou Shall Not Edit Another User’s Posts*  
Keeping users or anyone else from editing information they shouldn’t is taken seriously here at Not Reddit. Private functions were written and used in conjunction with rails methods such as `before_action` to authorize users and force login before allowing users to access any private page or update information. Cross-site request forgery, a type of hack which exploits a user who is already logged in, is also guarded against using Rail’s built-in `protect_from_forgery` method.

*Stong Parameters*  
Sometimes evil people might try to manipulate data they shouldn’t via [mass assignment](https://en.wikipedia.org/wiki/Mass_assignment_vulnerability). For instance, the hacker might input 

```http://www.not-reddit.com/user/signup?user[name]=username&user[role]=’admin’```

creating a user which is also an admin. Rails has a built-in way to handle this: Strong parameters. In each controller, it was specified which parameters are allowed to be passed in on any given page, eliminating the option to manipulate restricted data. For example, on the sign up page, a user may only input their name, email, password, and password confirmation. Checkmate hacker.

## Concluding Remarks

While simple, Not Reddit securely and robustly allows users to interact via posts, comments, and voting. In the future, I would like to add some more searching and filtering features to the site. For example, currently, all of a topic’s posts are indexed according to an algorithm based on post date and rating. For starters, listing all posts for a topic will become slow and cumbersome to browse as the number of posts grows. Pagnition or something similar should be used instead. Building on that, a user should be able to search both topics and posts, as well as comments. Advanced search methods, potentially ones using AJAX, would be a great addition to the site. 

Additionally, the site could use more robust CSS. As a disclaimer, the site is fully responsive and looks acceptable on any device, whether smartphone or computer. That being said, sometimes when the window is resized, the layout is subpar. Certain elements could be tweaked in size and position to give a more aesthetic feel. However, the focus of this project was more on backend and the styling remained quite basic.


## Setup and Configuration

**Not Reddit**: [GitHub](https://github.com/baka-san/not-reddit) / [Live Site](https://not-reddit-heroku.herokuapp.com/)

**Languages and Frameworks:**
- Ruby 2.4.0
- Rails 5.1.3
- Bootstrap 3

**Databases:**
- SQLite (Test, Development)
- PostgreSQL (Production)

**Development Tools and Gems include**:
- BCrypt for secure passwords
- SendGrid for email confirmation
- Rspec and FactoryGirl for tests

**Environment and Setup**
- Figaro was used to set environmental variables and can be found in `config/application.yml`. For security reasons, this file has been replaced with an example file `config/application.example.yml` on GitHub to demonstrate proper storage of environmental variables.

### To Run Locally
- [Visit Not Reddits's GitHub](https://github.com/baka-san/not-reddit)
- [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
- Run `bundle install` on command line
- Create and migrate the SQLite database with `rake db:create` and `rake db:migrate`
- Start the server using `rails server`
- Run the app on `localhost:3000`
