import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
  // code to run on server at startup
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
