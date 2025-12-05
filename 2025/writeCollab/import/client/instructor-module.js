// Import packages
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

// Import the HTML file so the template(s) can be loaded.
import './instructor-module.html';

Template.instructorHome.onCreated(function() {
	this.itemCat = new ReactiveVar('allItems');
	Tracker.autorun(
		function() {
			Meteor.subscribe('writeProjects', Session.get('userSession'), Session.get('browseSession'));
		}
	);
});

Template.instructorHome.helpers(
	{
		writeProjects: function() {
			let currentItemCat = Template.instance().itemCat.get();
			if(currentItemCat === 'incompleteItems') {
				return writeProjectDB.find({status: 'incomplete'}, {sort: {createdAt: -1}});
			}
			else if(currentItemCat === 'completeItems') {
				return writeProjectDB.find({status: 'complete'}, {sort: {createdAt: -1}});
			}
			else if(currentItemCat === 'newItems') {
				return writeProjectDB.find({isNew: true}, {sort: {createdAt: -1}});
			}
			return writeProjectDB.find({}, {sort: {createdAt: -1}});
		}
	}
);

// All event listeners for the instructor interface.
Template.instructorHome.events(
	{
		'click input[type="radio"]': function(event, instances) {
			// Get the ID of the current target, and set the 
			// template reactive variable to be this ID.
			let newItemCat = event.currentTarget.id;
			instances.itemCat.set(newItemCat);
		},
		// Load the template to create a new writing project
		// after the instructor clicks on the "createNewProject" button.
		'click #createNewProject': function() {
			Session.set('browseSession', 'createProject');
		},
		'click table > tbody td:first-of-type': function(event) {
			let projectID = event.currentTarget.id.replace('project_', '');
			Meteor.call('clearNewStatus', projectID, 'instructor');
			Session.set('browseSession', 'commenting');
			Session.set('currentProjectID', projectID);
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

Template.commenting.onCreated(
	function() {
		Tracker.autorun(
			function() {
				Meteor.subscribe('singleWriteProject',
					Session.get('currentProjectID'), Session.get('userSession'));
			}
		);
	}
);

Template.commenting.helpers(
	{
		compReadonly: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.status === 'complete') {
				return 'readonly';
			}
			return '';
		},
		projectInfo: function(key) {
			let currentProject = writeProjectDB.findOne();
			return currentProject && currentProject[key];
		},
		isComplete: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.status === 'complete') {
				return true;
			}
			return false;
		}
	}
);

Template.commenting.events(
	{
		// Save the current draft (and quit) when click on either "save" button
		// in the template.
		'click #save, click #saveAndQuit': function(event) {
			// Get the current new draft from the value of the #essay <textarea>.
			let commentDraft = document.getElementById('comments').value;
			// Send the essay draft and the project ID to the server method "saveStudentDraft".
			// We need "callAsync" because we need to take different actions based on the response
			// from the server.
			Meteor.call('saveInstructorDraft', Session.get('currentProjectID'), commentDraft);
			alert('Draft saved!');
			if(event.currentTarget.id === 'saveAndQuit') {
				Session.set('browseSession', 'instructorHome');
				Session.set('currentProjectID', '');
			}
		},
		// If the users click on the #quit button...
		'click #quit': function() {
			// Set the browse session to "studentHome", and reset the currentProjectID to nothing.
			Session.set('browseSession', 'instructorHome');
			Session.set('currentProjectID', '');
		},
		'click #submit, click #submitAndClose': function(event) {
			let submitType = event.currentTarget.id;
			if(confirm('Are you sure to submit your comments?')) {
				let commentDraft = document.getElementById('comments').value;
				Meteor.call('submitInstructorDraft', 
					Session.get('currentProjectID'), commentDraft, submitType);
				Session.set('browseSession', 'instructorHome');
				Session.set('currentProjectID', '');
			}
		}
	}
);