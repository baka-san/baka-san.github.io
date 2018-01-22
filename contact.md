---
layout: page
title: Contact
class: contact
permalink: /contact/
feature-img: "img/color.png"
---

Please write your name, email, and a brief description of why you're sending me a message.

<form action="https://getsimpleform.com/messages?form_api_token=deff7c2979f46f02cf18e1e6dca6c7a8" method="post">
  <!-- the redirect_to is optional, the form will redirect to the referrer on submission -->
  <!-- <input type='hidden' name='redirect_to' value='https://baka-san.github.io/thank-you/' /> -->
  <input type='hidden' name='redirect_to' value='http://grantbackes.com/thank-you/' />
  <input type='text' name='name' placeholder='Your Full Name' required />
  <input type='email' name='email' placeholder='Your E-mail Address' required/>
  <textarea name='message' placeholder='Write your message ...' required></textarea>
  <input type='submit' value='Send Message' />
</form>