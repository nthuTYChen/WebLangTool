/* Nov 21, 2025: To begin with, install the following packages:
   session reactive-var
 */

// Import the session and mongo package.
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';
// Load the main HTML file as usual.
import './main.html';

// Create a global variable that refers to the local copy of the writeProjectDB collection
global.writeProjectDB = new Mongo.Collection('writeProjectDB');

// Set the default browseSession to "frontPage", so this template will be loaded
// by default after /client/main.html is imported.
Session.setDefault('browseSession', 'frontPage');
// When the application starts, the user is still "nobody", so the user session
// is set as an empty string.
Session.setDefault('userSession', '');

Template.body.helpers(
   {
      // For dynamic template loading in <body> in /client/main.html
      browseSession: function() {
         return Session.get('browseSession');
      }
   }
);

// On the front page, take different actions when the users click on one
// of the two buttons to specify their "identity" as a student or an instructor
// and load the respective user interface.
Template.frontPage.events(
   {
      // For the student
      'click #studentCheckIn': function() {
         // Import the student module
         import('/import/client/student-module.js').then(function() {
            // After the module is imported, change the browse session to
            // "studentHome", so this template can be loaded from
            // /import/client/student-module.html.
            Session.set('browseSession', 'studentHome');
            // Also change the user session to "student". You probably don't
            // need this with a real user-password system, since the identity
            // could be specified in each user profile.
            Session.set('userSession', 'student');
         });
      },
      // For the instructor; same logics, so the similar explanations are not
      // repeated below
      'click #instructorCheckIn': function() {
         import('/import/client/instructor-module.js').then(function() {
            Session.set('browseSession', 'instructorHome');
            Session.set('userSession', 'instructor');
         });
      }
   }
);