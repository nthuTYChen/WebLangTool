/* Nov 12, 2025: To begin with, install the following packages:
   session reactive-var
 */

// Import the session package.
import { Session } from 'meteor/session';
// Load the main HTML file as usual.
import './main.html';

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
// of the two buttons to specify their "identity" as a student or an instructor.
Template.frontPage.events(
   {
      // For the instructor first.
      'click #instructorCheckIn': function() {
         // Import the instructor module.
         import('/import/client/instructor-module.js').then(function() {
            // After the module is imported, change the browse session to
            // "instructorHome", so this template can be loaded from
            // /import/client/instructor-module.html.
            Session.set('browseSession', 'instructorHome');
            // Also change the user session to "instructor". You probably don't
            // need this with a real user-password system, since the identity
            // could be specified in each user profile.
            Session.set('userSession', 'instructor');
         });
      }
   }
);