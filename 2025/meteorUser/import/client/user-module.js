// Import the corresponding HTML file so the templates could be loaded.
import './user-module.html';

// These helpers mainly help retrieve and return user information to the
// Web interface.
Template.userHome.helpers(
	{
		/* Get the user data object, and return the info stored in the
		   "fullname" key of the "profile" object of the user data object.
		   See /import/client/account-module.js for how a user profile
		   is organized when a user sign up for an account.*/
		fullname: function() {
			let userData = Meteor.user();
			return userData.profile.fullname;
		},
		/* Get the user data object, and return the "top-level" info
		   from the object based on the name of the "key" passed from
		   the HTML file (see account-module.html). If you need to
		   retrieve lots of information from the same level of an
		   object, this is the way to go because you don't need to create
		   different helpers just to return different information. */
		userProfile: function(key) {
			let userData = Meteor.user();
			return userData[key];
		}
	}
);

// The only event listener for logging the current user out.
Template.userHome.events(
	{
		'click #logout': function() {
			Meteor.logout();
			// Switch back to the signIn browseSession to load
			// the front page after logging out.
			Session.set('browseSession', 'signIn');
		}
	}
);