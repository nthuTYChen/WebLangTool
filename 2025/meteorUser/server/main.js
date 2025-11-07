// At this point, this file only tests the email delivery function.

import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

Accounts.config(
  {
    sendVerificationEmail: true
  }
);

Accounts.emailTemplates.siteName = 'Language Learning App';
Accounts.emailTemplates.from = 'App admin <noreply@languagelearning.app>';

Accounts.emailTemplates.verifyEmail.subject = function() {
  return 'Welcome to the Language Learning App';
};

Accounts.emailTemplates.verifyEmail.text = function(user, verifyURL) {
  let verifyEmailText =
    'Welcome to the Language Learning App! Verify your account with the link below.\n\n' +
    verifyURL;
  return verifyEmailText;
};

Accounts.onCreateUser(
  function(options, user) {
    user.profile = options.profile;
    user.currentLoginTime = null;
    user.lastLoginTime = null;
    return user;
  }
);

Accounts.validateLoginAttempt(
  function(attempt) {
    //console.log(attempt);
    if(!attempt.allowed) {
      return false;
    }
    if(attempt.methodName === 'createUser') {
      throw new Meteor.Error('no-create-user-login', 'Do not log in after registration.');
    }
    return true;
  }
);

Meteor.startup(function() {
  // Set the SMTP service URL. You might need the fakeSMTP application
  // to test the code in this section.
  process.env.MAIL_URL = 'smtp://localhost:2525';
  /*Email.sendAsync(
    {
      from: 'test@test.com',
      to: 'test@test.com',
      subject: 'Test',
      text: 'Text!'
    }
  );*/
});
