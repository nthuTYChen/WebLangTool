import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

// Configurate the accounts-base package so that the server sends
// verification email when a new user is created.
Accounts.config(
  {
    sendVerificationEmail: true
  }
);

// Set the site name and the "from" field of an email sent by the
// accounts-base package.
Accounts.emailTemplates.siteName = 'Language Learning App';
Accounts.emailTemplates.from = 'App admin <noreply@languagelearning.app>';

// For the "subject" of the verification email, simply use
// "Welcome to the Language Learning App". Since it is a function,
// you can actually do more to make the subject even more customized.
Accounts.emailTemplates.verifyEmail.subject = function() {
  return 'Welcome to the Language Learning App';
};

// For the body text of the verification email, we can combine the 
// verification link (verifyURL) to other texts in the function. Since
// the function also receives the user information, the body text
// could also be more customized for each user.
Accounts.emailTemplates.verifyEmail.text = function(user, verifyURL) {
  let verifyEmailText =
    'Welcome to the Language Learning App! Verify your account with the link below.\n\n' +
    verifyURL;
  return verifyEmailText;
};

// Once Accounts.createUser() is initiated 
// (see /import/client/account-module.js), Accounts.onCreateUser() is the first
// function initiated on the server side. This function is helpful for 
// "pre-processing" the user data (e.g., check the email format or 
// password length, exclude malicious contents).
Accounts.onCreateUser(
  function(options, user) {
    // In the current demo, we simply attach the user profile in the "options"
    // object received by this function to the user info object.
    user.profile = options.profile;
    // But we also add two more keys to the user info object for user data
    // management, namely the time of the current login and the last login.
    user.currentLoginTime = null;
    user.lastLoginTime = null;
    // After this "pre-processing", return the validated user data.
    return user;
  }
);

// Once a new user is created, the accounts-password package by default
// sign in the new user. For security reasons, we'd like to stop this 
// default behavior, which can be done in this validateLoginAttempt()
// function. This function is initiated when a user is being logged in.
Accounts.validateLoginAttempt(
  // validateLoginAttempt() runs a function that receives the information
  // related to the current login "attempt".
  function(attempt) {
    //console.log(attempt);
    // If this login attempt is simply not allowed, return "false" to
    // block the login process.
    if(!attempt.allowed) {
      return false;
    }
    // If the login attempt is allowed, but it is driven by the "createUser"
    // method, throw an error back to the client and block the login process.
    if(attempt.methodName === 'createUser') {
      // In Meteor.Error(), the first string defines the error type, and 
      // the second string is the message of the error.
      throw new Meteor.Error('no-create-user-login', 'Do not log in after registration.');
    }
    // Otherwise, return "true" to approve the login attempt.
    return true;
  }
);

Meteor.startup(function() {
  // Set the SMTP service URL. You might need the fakeSMTP application
  // to test the code in this section.
  process.env.MAIL_URL = 'smtp://localhost:2525';
  // This is only for testing the email delivery function and should be
  // marked off most of the time.
  /*Email.sendAsync(
    {
      from: 'test@test.com',
      to: 'test@test.com',
      subject: 'Test',
      text: 'Text!'
    }
  );*/
});
