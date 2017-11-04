---
layout: post
title: Not Reddit
thumbnail-path: "img/not_reddit.png"
short-description: A place where you can share links and discuss rad topics with neckbeards.

---


{:.center}
![]({{ site.baseurl }}/img/not_reddit.png)

Built using Ruby on Rails for backend, Bootstrap for a fully-responsive experience, PostgreSQL for database, and Rspec for all testing, Not Reddit provides a simple yet overall satisfying environment for users to discuss a range of topics. While Not Reddit may be navigated by guests, for the best experience, an account should be created. This provides the ability to create new posts, comment, upvote and downvote, favorite and follow posts receiving email notifications when another user comments, maintain a profile, as well as a few other features. In this post, we will explore the site page by page.

## Home Page
A user is greeted by Not Reddit’s welcome page, allowing a user to sign in or sign up. The welcome page is representative of Not Reddit’s design - [simple yet powerful](https://conversionxl.com/blog/why-simple-websites-are-scientifically-better/) - allowing users to focus on posting links, upvoting and downvoting, and getting into discussions and debates with other users. The page also boasts the site’s impressive accomplishments such as ending world hunger and poverty minutes after being launched. It also has been shown to make people significantly better looking in the laboratory. Thanks Not Reddit.

## Topics Pages
The topics page is viewable to any user, though only admin users can create new topics. This was intentional, in order to keep topics focused and prevent redundancy. Each topic is followed by a short description, allowing users to get an idea of what might be discussed.

When a topic is selected, the user is shown a more detailed view of the topic as well as all its associated posts. Posts are sorted by an algorithm based on number of votes and age of the post, keeping the feed fresh, yet populated with popular content.

## Post Page
Posts are also viewable to any user, however only a user who is logged in may comment, vote, or favorite the post. Any user who has favorited a post will receive email notifications via  SendGrid when a new comment is posted. The owner of a post may delete the post, while the owner of a comment may delete their own comments. An admin can do whatever they want so don’t piss them off, bro.

## User Profile
Gettin trolled? GHop on over to their profile page to see what they’ve been up to. User’s with gravatar will have an image displayed along with the number of posts and comments they’ve made. All posts, comments, and favorited posts are also displayed chronologically on every user’s profile. This helps users stay in touch and discuss more with similar-minded people (as well as avoid those they don’t like).

## Privacy, Security, and Technical Junk

*Private Topics*  
Don’t want your employer - or worse, your mom - to find out what you’ve been doing on Not Reddit? No problem, just make a your topic private. This cool feature hides the topic from all guest users, eliminating the threat of an employer or your mother stumbling on your discussion.

*Thou Shall Not Edit Another User’s Posts*  
Keeping users or anyone else from editing information they shouldn’t is taken seriously here at Not Reddit. Private functions were written and used in conjunction with rails methods such as `before_action` to authorize users and force login before allowing users to access any private page or update information. Cross-site request forgery, a type of hack which exploits a user who is already logged in, is also guarded against using Rail’s built-in `protect_from_forgery` method.

*Stong Parameters*  
Sometimes evil people might try to manipulate data they shouldn’t via [mass assignment](https://en.wikipedia.org/wiki/Mass_assignment_vulnerability). For instance, the hacker might input 

```http://www.not-reddit.com/user/signup?user[name]=username&user[role]=’admin’```

creating a user which is also an admin. Rails has a built-in way to handle this: Strong parameters. In each controller, it was specified which parameters are allowed to be passed in on any given page, eliminating the option to manipulate restricted data. For example, on the sign up page, a user may only input their name, email, password, and password confirmation. Checkmate hacker.

*Rails’ CORS Defaults*  

*Rails XSS Token*  (how is this different than protect_from_forgery?)






