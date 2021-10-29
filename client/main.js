import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import './main.html';
import './lib/session.js';
import './lib/databases.js';

Template.body.helpers({
  webSession: function() {
    return Session.get('webSession');
  }
});

Template.index.events({
  'click button': function() {
    import('/import/client/student/user.js').then(function() {
      Session.set('webSession', 'user');
    });
  }
});