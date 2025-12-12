import './main.html';

Session.setDefault('browseSession', 'frontPage');

Template.body.helpers(
   {
      browseSession: function() {
         return Session.get('browseSession');
      }
   }
);

Template.frontPage.helpers(
   {
      // Place individual characters in an array (non-reactive) and return
      // the array to the front page, so we won't have to manually include
      // HTML elements in the HTML file, which save us some work.
      frontPageHeader1: function() {
         let header = ['E', 'n', 'g', 'l', 'i', 's', 'h'];
         return header;
      },
      frontPageHeader2: function() {
         let header = ['S', 'h', 'u', 'f', 'f', 'l', 'e', '!'];
         return header;
      }
   }
);