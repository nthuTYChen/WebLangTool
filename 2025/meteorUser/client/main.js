/* Nov 1, 2025 - To start with, you need to add the following package to 
   this application: session email accounts-base accounts-password. */

/* This application is modularized as non-core templates and functions
   are now placed in /import/client/ */

import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

// Set a session variable "browseSession" to have the default value "signIn",
// which is designed to load the "signIn" template in /main.html by default.
Session.set('browseSession', 'signIn');

// Configure the action taken when an email verification link is processed.
Accounts.onEmailVerificationLink(
  // onEmailVerificationLink runs a function that receives two types of
  // information. "token" is the verification token taken directly from the
  // verification link, and "done" runs a function when the verification
  // process is complete, which is not used here.
  function(token, done) {
    // After the processing verification link is initiated, use verifyEmail()
    // to send the verification token to the server. A callback function is run
    // to process the potential error messages sent back from the server.
    Accounts.verifyEmail(token, function(err) {
      // Import account-module.js, so the templates in account-module.html
      // are ready to be loaded depending on the results of the verification process.
      import('/import/client/account-module.js').then(
        function() {
          // If there's any error message returned from the server...
          if(err) {
            // Change the browse session to load the "verifyFailed" template.
            Session.set('browseSession', 'verifyFailed');
          }
          // If there's no error message...
          else {
            // Change the browse session to load the "verifySuccess" template.
            Session.set('browseSession', 'verifySuccess');
          }
        }
      );
    });
  }
);

// The single helper returns the browseSession variable for dynamic
// template loading.
Template.body.helpers(
  {
    browseSession: function() {
      return Session.get('browseSession');
    }
  }
);

Template.signIn.events(
  {
    // When clicking on the #signUp button in the signIn template,
    // import the account-module.js, and then change the browse session
    // to "signUp", so the signUp template can be loaded.
    'click #signUp': function() {
      import('/import/client/account-module.js').then(
        function() {
          Session.set('browseSession', 'signUp');
        }
      );
    }
  }
);

