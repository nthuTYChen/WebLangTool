import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

Accounts.config({
  sendVerificationEmail: true
});

Accounts.emailTemplates.siteName = 'Language Learning App';
Accounts.emailTemplates.from = 'App Admin <noreply@languagelearning.app>';

Accounts.emailTemplates.verifyEmail.subject = function() {
  return 'Welcome to the Language Learning App';
};

Accounts.emailTemplates.verifyEmail.text = function(user, verifyURL) {
  let verifyEmailText = 
    'Welcome to the Language Learning App! Verify your account with the link below.\n\n' + verifyURL;
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
    //Block new users from being logged in automatically
    if(!attempt.allowed) {
      return false;
    }
    if(attempt.methodName === 'createUser') {
      throw new Meteor.Error('no-create-user-login', 'Do not log in after registration');
    }
    return true;
  }
);

Meteor.startup(function() {
  process.env.MAIL_URL = 'smtp://localhost:2525';
  // code to run on server at startup
  /*Email.sendAsync(
    {
      from: 'test@test.com',
      to: 'test@test.com',
      subject: 'test',
      text: 'test.'
    }
  );*/
});
