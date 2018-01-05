---
layout: post
title: Not Wikipedia
thumbnail-path: "img/not_wikipedia.png"
short-description: Like Wikipedia, Only Not
---

{:.center}
![]({{ site.baseurl }}/img/not-wikipedia.png)

<div class='not-wikipedia' markdown="1">

I WOULD LOVE TO ADD BETTER ERROR MESSAGES AND REDIRECTS FOR PUNDIT

MORE TESTING

BETTER USER INTERFACE SUCH AS CONFIRMATIONS WHEN DATA IS ENTERED OR BEFORE YOU DELETE YOURSELF 

BETTER PERMISSIONS, E.G. NO DELETING OTHER PEOPLE'S POSTS, ETC

DATA BACKUP FOR RECOVERY


Like Wikipedia, Not Wikipedia is a user-maintained encyclopedia. Anyone can view the information on the site, however, to get involved with creating and maintaining wikis, a user needs to create a free account. From there, a user can upgrade to a paid membership, allowing the creation of private wikis, which can be shared with individuals the user wishes to collaborate with.

The app is deployed on Heroku: https://not-wikipedia-heroku.herokuapp.com/

The source code is available at GitHub: https://github.com/baka-san/not-wikipedia

## Features
- Anyone can view public wikis by browsing the site.
- Users can create, edit, delete, and maintain any public wiki using [Markdown syntax](https://en.wikipedia.org/wiki/Markdown).
- Users can pay to upgrade to a premium account, allowing the creation of private wikis.
- Premium users can invite other users to collaborate on private wikis they have created.
- Premium users can cancel their subscription.
- When a user downgrades their account, their private wikis will automatically be made public.


## Users and User Roles
Rather than creating an authentication system from scratch, [Devise](https://github.com/plataformatec/devise) was used for user authentication. Devise provides a plethora of customizable options, though only some, such as account recovery via email, were included. By including this Gem and following along with the Devise documentation, I was quickly able to allow users to sign up for Not Wikipedia. However, this was the easiest step. 

One challenge of this website was to create different user roles - standard, premium, or admin - as well as handling non-users. A guest should be able to browse through wikis, but they should not be able to edit or delete anything. Standard users should be able to edit and delete public pages, while premium users should be able to create private wikis which they can invite others to collaborate on. Clearly, care needed to be taken handling all of the different roles and permissions. [Pundit](https://github.com/elabs/pundit) was chosen to handle authorization for the wiki pages.

Pundit is centered around creating policies which govern whether a user is authorized to perform a particular RESTful action. For example, the code below, which is contained in the wiki policy, checks whether a user can delete a wiki. If the wiki is private, the code checks if the user is the owner, an admin, or a collaborator. If they are, then they can delete the wiki; if they aren’t, the action is not allowed. If the wiki is public, the code just verifies that a user is present. Similar code can be found for all RESTful actions in `app/policies/wiki_policy.rb`. 

{:.center}
![]({{ site.baseurl }}/img/not-wikipedia/pundit-wiki-policy-1.png)

Calling such policies is actually quite easy. In the controller, one simply must specify a user and a wiki. However, due to Pundit’s magical powers of inference, `current_user` is assumed and only a wiki needs to be passed like follows:

{:.center}
![]({{ site.baseurl }}/img/not-wikipedia/pundit-wiki-policy-2.png)

**The last amazing thing Pundit allows is easy scoping. In `wiki_policy.rb`, admin and premium users were specified to be able to see all wikis while standard users can only see public wikis and wikis which they are collaborating on. Then to use the scope, in the controller, something like `@wikis = policy_scope(Wiki)` can be retrieve the appropriate wikis for the current user. MOVE THIS**

## Upgrading to Premium
I like money, so getting users to upgrade and give me their cash is pretty important. [Stripe](https://stripe.com/) is the way I went for payments and if you haven’t tried it out, you should. The difficulty in implementing the code is that both ActiveRecord (user and subscription models) and the Stripe database (customer, subscription, plan, and credit card) all had to communicate with each other and be maintained. The subscription cycle is as follows:
1. The user decides to upgrade to a premium plan.
2. The user enters their credit card information.
3. The credit card information is securely sent to Stripe.
4. Stripe sends back a token which is used to create a customer and subscription (`subscriptions_service.rb`).

{:.pull-left .subscription-service}
![]({{ site.baseurl }}/img/not-wikipedia/subscription-service-1.png)

{:.pull-right .subscription-service}
![]({{ site.baseurl }}/img/not-wikipedia/subscription-service-2.png)

5\. The user's role is changed from standard to premium and a new subscription is created in ActiveRecord. Sensitive information is not stored, however, Stripe customer and subscription ids are stored and are used when communicating with Stripe (`subscriptions_controller.rb`).    
6\. After a month, Stripe attempts to charge the card again and renew the subscription resulting in a success or failure. The resulting event object is sent by Stripe via an HTTP POST request which is handled by the stripe controller. The “webhook” route is specified in `routes.rb`. If the payment is successful, the subscription dates are upgraded in ActiveRecord. If the payment is unsuccessful, the subscription is deleted on both Stripe and in ActiveRecord and the user is downgraded accordingly.  
7\. Lastly, at any time during the billing period, a user may wish to cancel their autopay. This can be done on the user’s homepage. Doing so does not cancel the account immediately. Rather, Stipe is told to cancel the subscription at the end of the cycle via `at_period_end: true` and ActiveRecord’s `Subscription.autopay` is set to `false` (`subscriptions_controller#turn_off_autopay`). Likewise, autopay can be turned on again anytime before the subscription period ends in the same manner (`subscriptions_controller#turn_on_autopay`). When it comes time to charge the user again, if `at_period_end` is `true`, the user will not be charged and their subscriptions will be deleted from Stripe and ActiveRecord.  

















# Setup and Configuration

**Languages and Frameworks**: Ruby on Rails and Bootstrap

**Ruby version 2.4.0**

**Rails 5.1.4**

**Databases**: SQLite (Test, Development), PostgreSQL (Production)

**Development Tools and Gems include**:

- [Devise](https://github.com/plataformatec/devise) for user authentication
- [SendGrid](https://sendgrid.com/) for email confirmation
- [Redcarpet](https://github.com/vmg/redcarpet) for Markdown formatting
- [Markdown-js](https://github.com/evilstreak/markdown-js) for live Markdown formatting
- [Pundit](https://github.com/elabs/pundit) for authorization
- [Stripe](https://stripe.com/) for payments
- [Rspec](https://github.com/rspec/rspec-rails) and [FactoryGirl](https://github.com/thoughtbot/factory_bot) for tests

**Setup:**

- Environment variables were set using Figaro and are stored in `config/application.yml` (ignored by git). `config/application.example.yml` demonstrates how to store environment variables.

**To run Not Wikipedia locally:**

- [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
- Run `bundle install` on command line
- Create and migrate the SQLite database with `rake db:create` and `rake db:migrate`
- Start the server using `rails server`
- Run the app on `localhost:3000`



</div>
