---
layout: post
title: Not Wikipedia
class: not-wikipedia
script-path:
- scripts/not-wikipedia.js
thumbnail-path: "img/not-wikipedia/not-wikipedia-thumb.gif"
short-description: Like Wikipedia, Only Not
---


{% include figure-center.html url="/img/not-wikipedia/not-wikipedia.gif" title="" class="" %}



## Overview

Like Wikipedia, Not Wikipedia is a user-maintained encyclopedia. Anyone can view the information on the site, however, to get involved with creating and maintaining wikis, a user needs to create a free account. From there, a user can upgrade to a paid membership, allowing the creation of private wikis, which can be shared with individuals the user wants to collaborate with.

The app is deployed on [Heroku](https://not-wikipedia-heroku.herokuapp.com/).

The source code is available at [GitHub](https://github.com/baka-san/not-wikipedia).

### Features
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

Pundit was also used for scoping and setting the policy for collaborators, both of which will be discussed in later sections.


## Upgrading to Premium
I like money, so getting users to upgrade and give me their cash was pretty important. A premium user has the ability to both create private wikis and invite “collaborators” to work on their private wikis. Collaborators do not have to be premium users. A private wiki can be made public at any time.

[Stripe](https://stripe.com/) was the way I went for payments and if you haven’t tried it out, you should. The difficulty in implementing the code is that both ActiveRecord (user and subscription models) and the Stripe database (customer, subscription, plan, and credit card) all had to communicate with each other and be maintained. The subscription cycle is as follows:
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


7\. Lastly, a user may want to turn off autopay, leading to the cancellation of their account at the end of the billing period. This can be done on the user’s homepage. Doing so does not cancel the account immediately. Rather, Stipe is told to cancel the subscription at the end of the cycle via `at_period_end: true` and ActiveRecord’s `Subscription.autopay` is set to `false` (`subscriptions_controller#turn_off_autopay`). Likewise, autopay can be turned on again anytime before the subscription period ends in the same manner (`subscriptions_controller#turn_on_autopay`). When it comes time to charge the user again, if `at_period_end` is `true`, the user will not be charged and their subscriptions will be deleted from Stripe and ActiveRecord.  

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

{% include figure-left.html url="/img/not-wikipedia/wikis-index-admin.png" title="Fig 1: Admin's Scope" class="wiki-index" %}

{% include figure-left.html url="/img/not-wikipedia/wikis-index-standard-user.png" title="Fig 2: Some Standard User's Scope" class="wiki-index" %}

{% include figure-left.html url="/img/not-wikipedia/wikis-index-guest.png" title="Fig 3: Guest's Scope" class="wiki-index" %}

{% include figure-left.html url="/img/not-wikipedia/wikis-index-collaborating-on.png" title="Fig 4: Standard User, Collaborating On" class="wiki-index" %}


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

With scoping out of the way, the last concern was displaying the relevant wikis for users and allowing them to filter those wikis. In Figures 1, 2, and 4 it can be seen that a user can choose to see all wikis (those rendered by `policy_scope`), the own wikis they've created, and the private wikis they are collaborating on. Figure 4 displays a screenshot of the wikis a sample standard user is collaborating on. It should be noted that all filtering is done by securely passing a param to the `wiki#index` action, re-rendering the view appropriately.

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


## Live Editing of Wiki Pages

{% include figure-left.html url="/img/not-wikipedia/live-preview-1.gif" title="Fig 5: Wiki Edit View" class="fig-5-large" %}

{% include figure-left.html url="/img/not-wikipedia/live-preview-2.gif" title="Fig 5: Wiki Edit View" class="fig-5-small" %}

{% include figure-left.html url="/img/not-wikipedia/live-preview-3.gif" class="fig-5-small  " %}

In the `wiki#show` view, makdown is rendered through [Redcarpet](https://github.com/vmg/redcarpet), Markdown parser for Ruby. Since the show view is static - no data is changing - this option works great. The wiki's body is grabbed and passed through the Redcarpet, yielding beautiful markdown language. The problem is, in the `wiki#new` and `wiki#edit` views, the user enters and deletes data, but those changes are not reflected in ActiveRecord until the save button is pushed. So, a more dynamic Markdown parser was needed. Enter [Markdown-js](https://github.com/evilstreak/markdown-js), a Markdown parser for JavaScript. Using JavaScript, elements on the page can be grabbed and monitored for changes, regardless if ActiveRecord has been updated or not. The JavaScript code below watches the user input in the edit section, grabs that input on every keystroke, passes it to Markdown-js, and then takes that Markdown and attaches it to the live preview section. Also note the that the code below is wrapped in a try statement in order to stop the browser from throwing any unexpected errors.

{% highlight javascript %}
# app/assets/javascripts/wiki.js
...
  var wikiTitle = document.getElementById("wiki_title");
  var wikiBody = document.getElementById("wiki_body");
  var titlePreview = document.getElementById('live_title_preview')
  var bodyPreview = document.getElementById('live_body_preview')

  if (bodyPreview || titlePreview) {
    titlePreview.innerHTML = markdown.toHTML(wikiTitle.value);
    bodyPreview.innerHTML = markdown.toHTML(wikiBody.value);

    try{
        wikiTitle.onkeyup = wikiTitle.onkeypress = function(){
            titlePreview.innerHTML = markdown.toHTML(this.value);
        }
        wikiBody.onkeyup = wikiBody.onkeypress = function(){
            bodyPreview.innerHTML = markdown.toHTML(this.value);
        }
    }
    catch(e){}
  }
...
{% endhighlight %}


## Adding Collaborators

{% highlight ruby %}
class Collaboration < ApplicationRecord
  belongs_to :user
  belongs_to :wiki
end
{% endhighlight %}

{% highlight ruby %}
class User < ApplicationRecord
  has_many :wikis, dependent: :destroy
  has_many :collaborations, dependent: :destroy
  has_many :collaborating, through: :collaborations, source: :wiki
end
{% endhighlight %}

{% highlight ruby %}
class Wiki < ApplicationRecord
  belongs_to :user
  has_many :collaborations, dependent: :destroy
  has_many :collaborators, through: :collaborations, source: :user
end
{% endhighlight %}

The last major aspect of the site is adding collaborators to private wiki pages. A premium user can create private wikis and invite other users to help maintain the wiki. The first challenge of collaborators was deciding on a data model. What exactly is being created? What is the relationship between a wiki page and a user? Of course, a user [has many](http://guides.rubyonrails.org/association_basics.html#the-has-many-association) wikis and a wiki [belongs_to](http://guides.rubyonrails.org/association_basics.html#the-belongs-to-association) a user, but something more was needed here.

The solution was to use the [has many through](http://guides.rubyonrails.org/association_basics.html#the-has-many-through-association) association. I debated for a while on what to call the model which associates the user and wiki models. At first I thought that "collaborators" might be a good name for the model. This would mean that both a wiki and a user have many collaborators. While this sounds logical, it's actually quite misleading. For example, saying `User A` **has many** collaborators sounds as if the association is describing `User B`, `User C`, `User D`, etc. This is incorrect. The association is describing the relationship `User A` has with the wikis they are collaborating on, not other users who are collaborating on `User A`'s wikis. So, `User A` **has many** collaborators would mean that `User A` has many wikis which they are collaborating on - a very different meaning.

Scrapping the naming convention described above, I decided the best name for the association was "collaboration." Both a user and a wiki have many collaborations. Further, a user **has many** wikis they are "collaborating" on **through** the collaboration model. Likewise, a wiki **has many** "collaborators" (different than the hypothetical collaborators above) **through** the collaboration model. For example, `User A` **has many** collaborations and they are "collaborating" on many wikis as well. `Wiki XYZ` **has many** collaborations as well as "collaborators." The language is a little tricky, but I find it somewhat reminiscent of followers and following on Twitter or Instagram. Just remember "collaborations" associate the user and wiki models, users are "collaborating" on wikis, and wikis have "collaborators."

A final thing worth mentioning is that custom names were specified using the [source](https://stackoverflow.com/questions/4632408/understanding-source-option-of-has-one-has-many-through-of-rails) option. "Collaborating" was chosen instead of "wikis" (which would have resulted in conflicted naming) and "collaborators" was chosen instead of "users" for the **has many through** relationships. These **has many through** relationships were put to good use many times throughout the site, DRYing up a lot of code. For example, when filtering wikis, like in Figures 1-4, the wikis `current_user` is collaborating on can be retrieved with `current_user.collaborating`. Likewise, in Figure 6, the collaborators of a given wiki called `wiki` can be retrieved with `wiki.collaborators`.


{% include figure-left.html url="/img/not-wikipedia/collaborators.gif" title="Fig 6: Managing Collaborators" class="" %}

As seen in Figure 6, collaborators can be added via email and deleted with a button click. Creation and deletion of a collaborator each require a separate request to the collaborations controller and thus a page reload. I didn't like the idea of a user having to reload the page every time they added or removed a user, so I decided to make the [request with AJAX](http://railscasts.com/episodes/136-jquery-ajax-revised). The flow is as follows:

1\. A user searches for a collaborator in the search bar. [Data-remote](http://guides.rubyonrails.org/working_with_javascript_in_rails.html#built-in-helpers) stops the browser from posting a request and instead sends the request via AJAX.

{% highlight html %}
# app/views/wikis/edit.html.erb
...
  <div class="col-xs-12 col-sm-6 collaborators-form" id="collaborators_form">
    <h4><strong>Add a Collaborator</strong></h4>
    
    <form action="/wikis/<%=@wiki.id%>/collaborations" method="post" data-remote="true">
      <input id="search_bar" name="email" placeholder="Enter email">
      <input type="submit" value="Search">
    </form>

    <h3 class="notice" id="notice"><em></em></h3>
  </div>
...
{% endhighlight %}

2\. The AJAX request is received and handled with [respond_to](http://guides.rubyonrails.org/working_with_javascript_in_rails.html#server-side-concerns). If the request is an HTML request, it is ignored. Currently Not Wikipedia does not allow collaborators to be added or deleted via HTML requests. If the request is a javascript request, the controller responds based on the parameters passed. There are three cases to consider 1) the user is already a collaborator 2) the user isn't a collaborator or 3) there is not user with the provided email. The controller handles each of these cases and updates the database accordingly. Note that in Case 2, if a new collaborator is going to be added, the wiki is set to private and saved. This is to prevent users from making a wiki private in the form, adding collaborators, and then never saving the wiki as private.

{% highlight ruby %}
# app/controllers/collaborations_controller.rb
...
  def create
    respond_to do |format|
      format.js do
        
        @email = collaboration_params[:email].downcase!
        @wiki = Wiki.find(collaboration_params[:wiki_id])
        @collaborator = User.find_by(email: @email)

        # Collaborator exists
        if @collaborator && @collaborator.collaborating_on?(@wiki)
          render :create, locals: { collaborator: @collaborator, wiki: @wiki, state: "exists" }

        # New collaborator
        elsif @collaborator
          @collaboration = Collaboration.new(wiki_id: collaboration_params[:wiki_id], user_id: @collaborator.id)
          authorize @collaboration
          @collaboration.save

          # Make sure wiki is private
          @wiki.private = true
          @wiki.save
          render :create, locals: { collaborator: @collaborator, wiki: @wiki, state: "new" }

        # No such user
        else
          render :create, locals: { collaborator: @collaborator, wiki: @wiki, state: "no_user"}
        end
      end
    end
  end

...
{% endhighlight %}


3\. Either `create.js.erb` or `destroy.js.erb` are rendered and the view is updated. The `js.erb` ending allows for ruby to be interpreted in the javascript file. The below code shows how the edit view is updated after the create action.

{% highlight javascript %}
// app/views/collaborations/create.js.erb

  var collaboratorsList = $("#collaborators_list");
  var sidebarCollaboratorsList = $("#sidebar_collaborators_list");
  var notice = $("#notice");
  var searchBar = $("#search_bar");
  var checkbox = $("#wiki_private");

  // Clear previous notices
  notice.text("");

  // User is already collaborating
  <% case state

     when "exists" %>
      notice.text("That user is already collaborating!");

    <% when "new" %>
      notice.text("Collaborator added.");

      var collaborator =
        '<p id="collaborator_<%= collaborator.id %>">'
        +  '<a class="fa fa-times" '
        +     'data-remote="true" rel="nofollow" data-method="delete" href=\'<%= url_for(wiki_collaboration_path(id: wiki.id, user_id: collaborator.id)) %>\'>'
        +  '</a> <%= link_to collaborator.username, user_url(collaborator) %>'
        +'</p>';

      var sidebarCollaborator =
        '<li id="sidebar_collaborator_<%= collaborator.id %>">'
        +  '<a class="fa fa-times delete-collaborator" '
        +     'data-remote="true" rel="nofollow" data-method="delete" href=\'<%= url_for(wiki_collaboration_path(id: wiki.id, user_id: collaborator.id)) %>\'>'
        +  '</a><%= link_to collaborator.username, user_url(collaborator), class: "collaborator-name" %>'
        +'</li>';

      collaboratorsList.append(collaborator);
      sidebarCollaboratorsList.append(sidebarCollaborator);

    <% else %>
      notice.text("No user found. Try again.");

  <% end %>

  // Clear the search bar
  searchBar.val("");
{% endhighlight %}

If you were reading carefully, you may have noticed the line `authorize @collaboration` (if you didn't, it's ok...I still like you). That's right, I included another Pundit policy for collaborations. This policy specified that only admins, owners, and collaborators may add or delete collaborations. No scoping was necessary for collaborations.

{% highlight ruby %}
# app/policies/collaboration_policy.rb
...
  class CollaborationPolicy < ApplicationPolicy

    def initialize(user, collaboration)
      @user = user
      @collaboration = collaboration
      @wiki = Wiki.find(collaboration.wiki_id)
    end

    def create?
      authorized_for_this_private_wiki?
    end

    def destroy?
      authorized_for_this_private_wiki?
    end

    def authorized_for_this_private_wiki?
      @user && (@wiki.owner?(@user) || @user.admin? || @wiki.collaborators.include?(@user))
    end
  end
...
{% endhighlight %}

There are many other intricacies that weren't discussed here, such as all collaborators being destroyed if a user makes a private wiki public and rendering appropriate warning messages or asking the user for confirmation before leaving the page if data has been entered. The [source code](https://github.com/baka-san/not-wikipedia) is rather clean and well documented so it should be fairly easy to read. A lot of care was taken to make the UX go smoothly and cover these fringe cases.


## Other Pages

Due to how long this post is already, I'll briefly describe the other, less interesting, pages on the site. Each user has a profile page, where they can view basic membership information, update their subscription/autopay status, and view their wikis. A user also has a settings page where they can update basic information such as their email and password. They can also cancel their account. Devise also constructs user views for account confirmation, lost confirmations, forgotten passwords, etc. These pages are quite basic and could use more customization.


## Concluding Remarks
While Not Wikipedia employs a lot of great code, there was still so much I wanted to address. Here's a list of a few things off the top of my head:

1\. More testing. While testing was done - extensively for Pundit - more could always be added.

2\. Skinnier controllers, fatter models. There were a few times I definitely could have made some methods in the model and removed it from the controller.

3\. Better error messages and redirects for Pundit.

4\. Better styling. The layout is a little dull.

5\. A search bar for wikis rather than just browsing. Completely unscalable.

6\. Some sort of system similar to GitHub where versions of the wiki page are saved and users can jump to other states of the wiki.

7\. Better permissions, e.g. no deleting other people's wiki pages, only owners of a page can make it public, choose if your collaborators can add or delete other collaborators, approval from owner before edits are added to the page, etc.

8\. Allow users to change their credit card. Since Not Wikipedia doesn't store any information in the database, this would involve creating an ActiveRecord model for credit cards and associating it with the users model. Of course, full credit card numbers and sensitive information wouldn't be stored in ActiveRecord.

Thanks for reading and please check out the other posts on my site. If you have any remarks send me a message or comment below. If you are looking to employ me or in some other way give me your money, you can contact me through any of the methods listed on the top of the [home page]({{ site.baseurl }}/). Cheers.

## Setup and Configuration

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
- [Visit Not Wikipedia's GitHub](https://github.com/baka-san/not-wikipedia)
- [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
- Run `bundle install` on command line
- Create and migrate the SQLite database with `rake db:create` and `rake db:migrate`
- Start the server using `rails server`
- Run the app on `localhost:3000`