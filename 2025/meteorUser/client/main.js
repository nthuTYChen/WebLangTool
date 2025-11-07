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

Accounts.onEmailVerificationLink(
  function(token, done) {
    Accounts.verifyEmail(token, function(err) {
      import('/import/client/account-module.js').then(
        function() {
          if(err) {
            Session.set('browseSession', 'verifyFailed');
          }
          else {
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

