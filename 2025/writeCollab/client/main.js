/* Nov 12, 2025: To begin with, install the following packages:
   session reactive-var
 */

import { Session } from 'meteor/session';

import './main.html';

Session.setDefault('browseSession', 'frontPage');

Template.body.helpers(
   {
      browseSession: function() {
         return Session.get('browseSession');
      }
   }
);