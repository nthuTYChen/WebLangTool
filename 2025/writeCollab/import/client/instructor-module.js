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
		// Return project documents; see /import/client/student-module.js for explanations.
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
		// Change the project category based on the ID of a clicked
		// radio button.
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
		// When the title column of a project is clicked...
		'click table > tbody td:first-of-type': function(event) {
			// Get the project ID information based on the project title that
			// users click on from the "id" attribute of the <td> element.
			// See student-module.html.
			let projectID = event.currentTarget.id.replace('project_', '');
			// Send the project ID to the server method "clearNewStatus" to 
			// set "isNew" of the current student project to be FALSE.
			// See /server/main.js.
			Meteor.call('clearNewStatus', projectID, 'instructor');
			// navigate the student to the "commenting" template by setting the 
			// "browseSession" session variable.
			Session.set('browseSession', 'commenting');
			// Set the current project ID to the session variable "currentProjectID",
			// so the application can only subscribe to the current project info (see below).
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
				// Subscribe to the publication that only publish the information of the
				// current writing project based on the project ID and the user identity.
				Meteor.subscribe('singleWriteProject',
					Session.get('currentProjectID'), Session.get('userSession'));
			}
		);
	}
);

Template.commenting.helpers(
	{
		// If the current project is complete, return 'readonly', so students
		// can no longer edit their text in the #comments <textarea> element.
		compReadonly: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.status === 'complete') {
				return 'readonly';
			}
			return '';
		},
		// Return first-level project info based on the name of the key
		// received from the commenting template.
		projectInfo: function(key) {
			let currentProject = writeProjectDB.findOne();
			return currentProject && currentProject[key];
		},
		// Return true or false based on whether the "status" key of the project
		// document is "complete" or not.
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
		// If the users submit their comments
		'click #submit, click #submitAndClose': function(event) {
			// Get the type of submission (submit or submitAndClose)
			let submitType = event.currentTarget.id;
			// Use the JavaScript function confirm() to show a confirm box.
			// Only if the user click on 'OK', this if condition would be TRUE.
			// If the user click on 'Cancel', nothing in this block will run.
			if(confirm('Are you sure to submit your comments?')) {
				// Get the comment text from the #comments <textarea> element
				let commentDraft = document.getElementById('comments').value;
				// Send the current project ID and the essay draft to the server method
				// "submitInstructorDraft" (see /server/main.js), and take different actions
				// based on whether the server returns a normal response or an error.
				Meteor.call('submitInstructorDraft', 
					Session.get('currentProjectID'), commentDraft, submitType);
				// The comments will be saved anyway, so just navigate the users back to the
				// main instructor interface and reset the project ID.
				Session.set('browseSession', 'instructorHome');
				Session.set('currentProjectID', '');
			}
		}
	}
);