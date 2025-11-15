// Import the HTML file so the template(s) can be loaded.
import './instructor-module.html';

// All event listeners for the instructor interface.
Template.instructorHome.events(
	{
		// Clicking on the "Log Out" button
		'click #logout': function() {
			// Switch the browse session to "frontPage" after logging 
			// the user out.
			Session.set('browseSession', 'frontPage');
			// Set the user session to an empty string again after
			// logging out a user. With a real user-password system,
			// you will probably just need Meteor.logout().
			Session.set('userSession', '');
		}
	}
);