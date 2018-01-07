---
layout: post
title: Not Wikipedia
class: not-wikipedia
script-path:
- scripts/not-wikipedia.js
thumbnail-path: "img/not_wikipedia.png"
short-description: Like Wikipedia, Only Not
---

{:.center}
![]({{ site.baseurl }}/img/not-wikipedia.png)

I WOULD LOVE TO ADD BETTER ERROR MESSAGES AND REDIRECTS FOR PUNDIT

MORE TESTING

BETTER USER INTERFACE SUCH AS CONFIRMATIONS WHEN DATA IS ENTERED OR BEFORE YOU DELETE YOURSELF

BETTER PERMISSIONS, E.G. NO DELETING OTHER PEOPLE'S POSTS, ONLY OWNERS OF POSTS CAN MAKE IT PRIVATE, APPROVAL OF EDITS FROM OWNER, ETC

DATA BACKUP FOR RECOVERY

SEARCH FOR WIKIS RATHER THAN BROWSING

MAKE CONTROLLERS SKINNIER, MODELS FATTER







Like Wikipedia, Not Wikipedia is a user-maintained encyclopedia. Anyone can view the information on the site, however, to get involved with creating and maintaining wikis, a user needs to create a free account. From there, a user can upgrade to a paid membership, allowing the creation of private wikis, which can be shared with individuals the user wants to collaborate with.

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

{% highlight ruby %}
# app/policies/wiki_policy.rb
...
  def destroy?
    if @wiki.private?
      authorized_for_this_private_wiki?
    else
      @user.present?
    end
  end

  def authorized_for_this_private_wiki?
    @user && (@wiki.owner?(@user) || @user.admin? || @wiki.collaborators.include?(@user))
  end
...
{% endhighlight %}

Calling such policies is actually quite easy. In the controller, one simply must specify a user and a wiki.
In the controller, one must simply pass a wiki and Pundit magically infers `current_user` as the user (if desired, one can explicitly call pundit passing both a user and a wiki).

{% highlight ruby %}
# app/controllers/wikis_controller.rb
...
  def destroy
    @wiki = Wiki.find(params[:id])
    authorize @wiki

    if @wiki.destroy
      flash[:notice] = "\"#{@wiki.title}\" is dead. Good job, you killed it."
      redirect_to action: :index
    else
      flash.now[:alert] = "There was an error killing the wiki. The police will arrive shortly."
      render :show
    end
  end
...
{% endhighlight %}

Pundit was also used for scoping and setting the policy for collaborators, both of which will be disussed in later sections.


## Upgrading to Premium
I like money, so getting users to upgrade and give me their cash is pretty important. A premium user has the ability to both create private wikis and invite “collaborators” to work on their private wikis. Collaborators do not have to be premium users. A private wiki can be made public at any time.

[Stripe](https://stripe.com/) is the way I went for payments and if you haven’t tried it out, you should. The difficulty in implementing the code is that both ActiveRecord (user and subscription models) and the Stripe database (customer, subscription, plan, and credit card) all had to communicate with each other and be maintained. The subscription cycle is as follows:
1. The user decides to upgrade to a premium plan.
2. The user enters their credit card information.
3. The credit card information is securely sent to Stripe.
4. Stripe sends back a token which is used to create a customer and subscription.

{% highlight ruby %}
# app/services/subscriptions_service.rb
  {% include code/not-wikipedia/subscriptions_service.rb %}

{% endhighlight %}

5\. The user's role is changed from standard to premium and a new subscription is created in ActiveRecord. Sensitive information, such as credit card number, is not stored. Stripe customer and subscription ids are stored and are used when communicating with Stripe, however.   

{% highlight ruby %}
# app/controllers/subscriptions_controller.rb
...
def create
  # If the user already has an active subscription, don't allow them to subscribe again.
  if current_user.upgraded_account?
    flash[:alert] = "You're already a premium member you silly goose!"
    redirect_to current_user
  else
    begin
    # Create a subscription in the database and in Stripe
    SubscriptionsService.new(subscriptions_params, current_user).call_create

    current_user.upgrade_to_premium

    if current_user.save
      flash[:notice] = "Thanks for all the cash! Feel free to pay us again."
      redirect_to current_user
    else
      flash[:alert] = "We were unable to upgrade your account, but we still took your cash. Just kidding. Please try again or contact support."
      redirect_back(fallback_location: root_path)
    end
    
    # Stripe will send back CardErrors, displayed in this rescue block.
    rescue Stripe::CardError => e
      flash[:alert] = e.message
      redirect_to new_subscription_path
    end
  end
end
...

private

  def subscriptions_params
    params.permit(:stripeEmail, :stripeToken)
  end
...
{% endhighlight %}

6\. After a month, Stripe attempts to charge the card again and renew the subscription resulting in a success or failure. The resulting event object is sent by Stripe via an HTTP POST request which is handled by the stripe controller. The “webhook” route is specified in `routes.rb`. If the payment is successful, the subscription dates are upgraded in ActiveRecord. If the payment is unsuccessful, the subscription is deleted on both Stripe and in ActiveRecord and the user is downgraded accordingly.  

{% highlight ruby %}
# app/controllers/stripe_controller.rb
...
class StripeController < ApplicationController
  protect_from_forgery :except => :webhooks

  def webhooks
    begin
      event_json = JSON.parse(request.body.read)
      event_object = event_json['data']['object']
      #refer event types here https://stripe.com/docs/api#event_types
      case event_json['type']

        when 'invoice.payment_succeeded'
          # Update subscription in ActiveRecord
          customer = User.where(stripe_customer_id: event_object['customer']).first
          subscription = customer.subscription

          if subscription
            subscription.current_period_start = date.today.to_datetime.to_i
            subscription.current_period_end = date.today.to_datetime.to_i + 1.month.to_i
            subscription.save
          end

        when 'customer.subscription.deleted'
          # Find the customer from ActiveRecord
          customer = User.where(stripe_customer_id: event_object.customer).first
          subscription = customer.subscription

          # Delete the subscription from ActiveRecord
          if subscription
            subscription.destroy
            subscription.save
          end

          # Make user's private wiki's public
          private_wikis = customer.wikis.where(private: true)
          private_wikis.update_all(private: false)
      end
...
{% endhighlight %}


7\. Lastly, a user may want to turn off autopay, leading to the cancelation of their account at the end of the billing period. This can be done on the user’s homepage. Doing so does not cancel the account immediately. Rather, Stipe is told to cancel the subscription at the end of the cycle via `at_period_end: true` and ActiveRecord’s `Subscription.autopay` is set to `false` (`subscriptions_controller#turn_off_autopay`). Likewise, autopay can be turned on again anytime before the subscription period ends in the same manner (`subscriptions_controller#turn_on_autopay`). When it comes time to charge the user again, if `at_period_end` is `true`, the user will not be charged and their subscriptions will be deleted from Stripe and ActiveRecord.  

{% highlight ruby %}
# app/controllers/subscriptions_controller.rb
...
def turn_on_autopay
  if current_user.role != "premium"
    flash[:alert] = "You aren't a premium member!"
    redirect_back(fallback_location: root_path)
  else
    subscription = current_user.subscription
    subscription.turn_on_autopay

    flash.now[:notice] = "You're successfully set up to give us more money. Thanks for the cash!\
                      Your next payment will automatically occur on #{display_date(subscription.current_period_end)}."
    redirect_to current_user
  end
end

def turn_off_autopay
  if current_user.role != "premium"
    flash[:alert] = "You aren't a premium member!"
    redirect_back(fallback_location: root_path)
  else
    subscription = current_user.subscription
    subscription.turn_off_autopay

    flash.now[:notice] = "Your account will be downgraded on #{display_date(subscription.current_period_end)}. Goodbye mere standard user."
    redirect_to current_user
  end
end
...
{% endhighlight %}


## Browsing Wikis

{% include image.html url="/img/not-wikipedia/wikis-index-admin.png" title="Fig 1: Admin's Scope" class="wiki-index" %}

{% include image.html url="/img/not-wikipedia/wikis-index-standard-user.png" title="Fig 2: Some Standard User's Scope" class="wiki-index" %}

{% include image.html url="/img/not-wikipedia/wikis-index-guest.png" title="Fig 3: Guest's Scope" class="wiki-index" %}

{% include image.html url="/img/not-wikipedia/wikis-index-collaborating-on.png" title="Fig 4: Standard User, Collaborating On" class="wiki-index" %}


All of the wiki pages are accompanied by a collapsible sidebar with options that change depending on the page and the user's role. For example, a guest obviously should not have options to see their own wikis because they don’t have any. As seen in Figure 3, for a guest, the option to create a new wiki redirects to the login page and is left as an incentive for guests to create an account. Each of the options on the sidebar is tailored to each user and page in such a way. 

The wiki index page can be seen in the above four images, Figures 1-4. Figures 1-3 show all wikis available for an admin, standard user, and guest respectively. Notice that an admin can see more wikis than a standard or guest user. This is due to the scoping policy specified with our old friend Pundit. In the index action of with wikis controller, one can simply call `policy_scope(Wiki)` and an array of all permitted wikis for the current user will be returned. In the policy below, it can be seen that:
- Admin users can view all wikis.
- Premium users can view private wikis they own, private wikis they are collaborating on, and public wikis.
- Standard users can view private wikis they are collaborating on and public wikis.
- Guests can only view public wikis (lame).


{% highlight ruby %}
# app/policies/wiki_policy.rb
...
class Scope < Scope

  attr_reader :user, :scope
  
  def initialize(user, scope)
    @user = user
    @scope = scope
  end

  def resolve
    wikis = []

    if user && user.admin?
      wikis = scope.all

    elsif user && user.premium?
      all_wikis = scope.all

      all_wikis.each do |wiki|
        if wiki.public? || wiki.owner == user || wiki.collaborators.include?(user)
          wikis << wiki
        end
      end

    else
      all_wikis = scope.all

      all_wikis.each do |wiki|
        if wiki.public? || wiki.collaborators.include?(user)
          wikis << wiki
        end
      end
    end

    wikis 
  end
end
...
{% endhighlight %}

With scoping out of the way, the last concern was displaying the relevant wikis for users and allowing them to filter those wikis. In Figures 1, 2, and 4, it can be seen that a user can choose to see all wikis (those rendered by `policy_scope`), the own wikis they've created, and the private wikis they are collaborating on. Figure 4 displays a screenshot of the wikis a sample standard user is collaborating on. It should be noted that all filtering is done by securly passing a param to the `wiki#index` action, rerendering the view appropriately.

{% highlight ruby %}
# app/controllers/wikis_controller.rb
...
  def index
    @wikis = policy_scope(Wiki)

    if params[:filter].present?
      if filter_params[:my_wikis]
        @index = current_user.wikis 
        @title = "My Wikis"
      elsif filter_params[:collaborating]
        @index = current_user.collaborating 
        @title = "Collaborating On"
      end

      @message = @index.empty? ? "None found." : nil 
    else
      @index = @wikis 
      @title = "Wikis"
    end
  end
...
{% endhighlight %}


## Live Editing of Wiki Pages and Adding Collaborators

{% include image.html url="/img/not-wikipedia/wiki-edit-live-preview.gif" title="Fig 5: Admin's Scope" class="" %}










# Setup and Configuration

**Languages and Frameworks**: Ruby on Rails and Bootstrap

**Ruby version 2.4.0**

**Rails 5.1.4**

**Databases**: SQLite (Test, Development), PostgreSQL (Production)

**Development Tools and Gems include**:

- [Devise](https://github.com/plataformatec/devise) for user authentication
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



