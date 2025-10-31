import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Session.set('browseSession', 'signIn');

Template.body.helpers(
  {
    browseSession: function() {
      return Session.get('browseSession');
    }
  }
);

Template.signIn.events(
  {
    'click #signUp': function() {
      import('/import/client/account-module.js').then(
        function() {
          Session.set('browseSession', 'signUp');
        }
      );
    }
  }
);

