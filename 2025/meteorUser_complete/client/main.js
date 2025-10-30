import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Session.setDefault('browseSession', 'signIn');

Accounts.onEmailVerificationLink(function(token, done) {
  //console.log(token);
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
});

Template.body.onCreated(
  function() {
    Tracker.autorun(function() {
      if(Meteor.user()) {
        import('/import/client/user-module.js').then(
          function() {
            Session.set('browseSession', 'userHome');
          }
        );
      }
    });
  }
);

Template.body.helpers(
  {
    browseSession: function() {
      return Session.get('browseSession');
    }
  }
);

Template.body.events(
  {
    'click #signIn': function() {
      let email = document.getElementById('username').value;
      let password = document.getElementById('password').value;
      Meteor.loginWithPassword(email, password, function(err) {
        if(err) {
          alert('login failed!');
        }
        else {
          import('/import/client/user-module.js').then(
            function() {
              Session.set('browseSession', 'userHome');
            }
          );
        }
      });
    },
    'click #signUp': function() {
      import('/import/client/account-module.js').then(
        function() {
          Session.set('browseSession', 'signUp');
        }
      );
    }
  }
);
