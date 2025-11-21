// Import the HTML file so the template(s) can be loaded.
import './instructor-module.html';

// All event listeners for the instructor interface.
Template.instructorHome.events(
	{
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

Template.createProject.events(
	{
		'click #create': function() {
			let projectProfile = {
				title: document.getElementById('projectTitle').value.trim(),
				studentName: document.getElementById('studentName').value.trim(),
				instructions: document.getElementById('instructions').value.trim(),
				wordLimit: Number(document.getElementById('wordLimit').value)
			};
			//console.log(projectProfile);
			Meteor.call('addNewProject', projectProfile);
			Session.set('browseSession', 'instructorHome');
		},
		'click #cancel': function() {
			Session.set('browseSession', 'instructorHome');
		}
	}
);