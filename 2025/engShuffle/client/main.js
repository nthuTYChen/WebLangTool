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