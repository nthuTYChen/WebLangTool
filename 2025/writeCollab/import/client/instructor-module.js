// Import the HTML file so the template(s) can be loaded.
import './instructor-module.html';

// All event listeners for the instructor interface.
Template.instructorHome.events(
	{
		// Load the template to create a new writing project
		// after the instructor clicks on the "createNewProject" button.
		'click #createNewProject': function() {
			Session.set('browseSession', 'createProject');
		},
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

// All event listeners for the project creation interface.
Template.createProject.events(
	{
		// When clicking on the "create" button...
		'click #create': function() {
			// Organize a project profile with the main information retrieved from
			// the project creation interface.
			let projectProfile = {
				title: document.getElementById('projectTitle').value.trim(),
				studentName: document.getElementById('studentName').value.trim(),
				instructions: document.getElementById('instructions').value.trim(),
				// Note that the value retrieved from a "number" input in the 
				// Web interface (see instructor-module.html) is still a string,
				// so it has to be converted into a number using Number().
				wordLimit: Number(document.getElementById('wordLimit').value)
			};
			// Call the "addNewProject" server method and send the project profile.
			Meteor.call('addNewProject', projectProfile);
			// Navigate the instructor back to the main instructor interface.
			Session.set('browseSession', 'instructorHome');
		},
		// When clicking on the "cancel" button, just go back to the main interface.
		'click #cancel': function() {
			Session.set('browseSession', 'instructorHome');
		}
	}
);