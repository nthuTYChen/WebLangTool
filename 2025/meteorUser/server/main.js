// At this point, this file only tests the email delivery function.

import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
  // Set the SMTP service URL. You might need the fakeSMTP application
  // to test the code in this section.
  process.env.MAIL_URL = 'smtp://localhost:2525';
  Email.sendAsync(
    {
      from: 'test@test.com',
      to: 'test@test.com',
      subject: 'Test',
      text: 'Text!'
    }
  );
});
