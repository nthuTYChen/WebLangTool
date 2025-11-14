/* Nov 12, 2025: To begin with, install the following packages:
   session reactive-var
 */

import { Session } from 'meteor/session';

import './main.html';

global.writeProjectDB = new Mongo.Collection('writeProjectDB');

Session.setDefault('browseSession', 'frontPage');
Session.setDefault('userSession', '');

Template.body.helpers(
   {
      browseSession: function() {
         return Session.get('browseSession');
      }
   }
);

Template.frontPage.events(
   {
      'click #studentCheckIn': function() {
         import('../import/client/student-module.js').then(function() {
            Session.set('browseSession', 'studentHome');
            Session.set('userSession', 'student');
         });
      },
      'click #instructorCheckIn': function() {
         import('../import/client/instructor-module.js').then(function() {
            Session.set('browseSession', 'instructorHome');
            Session.set('userSession', 'instructor');
         });
      }
   }
);