// Import packages
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

// Import the corresponding interface
import './student-module.html';

// Actions taken when the template "studentHome" is loaded
Template.studentHome.onCreated(function() {
	// Create a template to filer the project documents displayed in
	// the Web interface. The default value is set to be "allItems",
	// which is consistent with the radio button that is checked
	// by default. See student-module.html.
	this.itemCat = new ReactiveVar('allItems');
	// Subscribe to the "writeProjects" publication (see /server/main.js)
	// based on the browse session and the user session, so only a subset
	// of all documents are synced from the server.
	Tracker.autorun(
		function() {
			Meteor.subscribe('writeProjects', Session.get('userSession'), Session.get('browseSession'));
		}
	);
});

Template.studentHome.helpers(
	{
		// Return project documents
		writeProjects: function() {
			// Get the current project category from the template reactive variable.
			let currentItemCat = Template.instance().itemCat.get();
			// Based on the project category, return different subset of documents.
			// The option "sort" can order documents by a specific field. The target
			// strings under comparison (e.g., "incompleteItems") matches the IDs of
			// the radio buttons. See student-module.html
			if(currentItemCat === 'incompleteItems') {
				// Here, all documents are arranged by "createdAt" in decreasing (-1) order, 
				// so newer projects are displayed first.
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

Template.studentHome.events(
	{
		'click #logout': function() {
			// Switch the browse session to "frontPage" after logging 
			// the user out.
			Session.set('browseSession', 'frontPage');
			// Set the user session to an empty string again after
			// logging out a user. With a real user-password system,
			// you will probably just need Meteor.logout().
			Session.set('userSession', '');
		},
		// Change the project category based on the ID of a clicked
		// radio button.
		'click input[type="radio"]': function(event, instances) {
			// Get the ID of the current target, and set the 
			// template reactive variable to be this ID.
			let newItemCat = event.currentTarget.id;
			instances.itemCat.set(newItemCat);
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
			Meteor.call('clearNewStatus', projectID, 'student');
			// navigate the student to the "writing" template by setting the 
			// "browseSession" session variable.
			Session.set('browseSession', 'writing');
			// Set the current project ID to the session variable "currentProjectID",
			// so the application can only subscribe to the current project info (see below).
			Session.set('currentProjectID', projectID);
		}
	}
);

Template.writing.onCreated(
	function() {
		// Create a template reactive variable essayLength, which is by default 0.
		this.essayLength = new ReactiveVar(0);
		// Subscribe to the publication that only publish the information of the
		// current writing project based on the project ID and the user identity.
		Tracker.autorun(
			function() {
				Meteor.subscribe('singleWriteProject',
					Session.get('currentProjectID'), Session.get('userSession'));
			}
		);
	}
);

Template.writing.helpers(
	{
		compReadonly: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.status === 'complete') {
				return 'readonly';
			}
			return '';
		},
		// Return the current essay length to the writing template.
		essayLength: function() {
			// The decision on which number to return to the writing template is
			// dependent on several factor explained below.
			// First of all, get the template variable "essayLength".
			let currentEssayLength = Template.instance().essayLength;
			// Then, get the current project document.
			let currentProject = writeProjectDB.findOne();
			/* 1. If the project document has not been synced from the server,
			   currentProject would be "undefined", the entire if condition would be FALSE.
			   In this case, this helper will return whatever inside the template variable.
			   And since template variable is by default 0, this helper will return 0. */
			/* 2. If the project document has been synced from the server, check if 
			      the document comes with the "essay" key, which is NOT there by default
			      when the instructor created the first version of the project. In this case,
			      the entire if condition would be FALSE, and the helper will also return
			      whatever inside the template variable, which is by default 0. */
			/* 3. If the project document has been synced and there an "essay" key, and 
			      the current template variable has the value 0, it means there exists
			      an essay for this project document, and the users are just navigated
			      to this writin template (because the template variable is still the 
			      default value. In this case, the if condition is TRUE, and the following
			      action in the if block will be taken.  */
			if(currentProject && currentProject.essay && currentEssayLength.get() === 0) {
				/* Get the current draft from the project document, split the text into
				   an array by a space, and set the array length as the word count to the
				   template variable. Note that this action is taken only when the template
				   variable originally has the default value 0. If the template variable is
				   NOT 0, it means the length is already set for the current draft, and there
				   is no need to set the template variable again based on the essay stored 
				   in the project document. */
				currentEssayLength.set(currentProject.essay.split(' ').length);
			}
			return currentEssayLength.get();
		},
		// Return first-level project info based on the name of the key
		// received from the writing template.
		projectInfo: function(key) {
			// Get the one and only project document.
			let currentProject = writeProjectDB.findOne();
			// If the current project is NOT undefined, then return currentProject[key].
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
		},
		// Return true or false based on whether the project has the "comments" key
		// or not. If it is the first project version created by the instructor,
		// there is no "comments" key (see /server/main.js), so "currentProject.comments"
		// is undefined.
		isWithComments: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.comments) {
				return true;
			}
			return false;
		}
	}
);

Template.writing.events(
	{
		// Save the current draft (and quit) when click on either "save" button
		// in the template.
		'click #save, click #saveAndQuit': function(event) {
			// Get the current new draft from the value of the #essay <textarea>.
			let essayDraft = document.getElementById('essay').value;
			// Send the essay draft and the project ID to the server method "saveStudentDraft".
			// We need "callAsync" because we need to take different actions based on the response
			// from the server.
			Meteor.callAsync('saveStudentDraft', 
				Session.get('currentProjectID'), essayDraft).then(function() {
					// The function in then() takes actions with a "normal" response
					// from the server.
					// Show a pop-up message saying the draft has been saved.
					alert('Draft Saved!');
					// Check if the clicked button has the ID "saveAndQuit".
					if(event.currentTarget.id === 'saveAndQuit') {
						// If so, set the browse session to "studentHome", and reset the 
						// currentProjectID to nothing.
						Session.set('browseSession', 'studentHome');
						Session.set('currentProjectID', '');
					}
				}).catch(function(err) {
					// The function in catch() takes actions with an "error" response
					// from the server.
					// Only show the pop-up message with the reason of the error.
					alert(err.reason);
				});
		},
		// If the users click on the #quit button...
		'click #quit': function() {
			// Set the browse session to "studentHome", and reset the currentProjectID to nothing.
			Session.set('browseSession', 'studentHome');
			Session.set('currentProjectID', '');
		},
		'click #submit': function() {
			if(confirm('Are you sure to submit this draft?')) {
				let essayDraft = document.getElementById('essay').value;
				Meteor.callAsync('submitStudentDraft', 
					Session.get('currentProjectID'), essayDraft).then(function() {
						Session.set('browseSession', 'studentHome');
						Session.set('currentProjectID', '');
					}).catch(function(err) {
						alert(err.error);
					});
			}
		},
		// Whenever the users press a key and release a key (i.e., "key up") in the #essay <textarea>...
		'keyup #essay': function(event, instances) {
			// Get the new text stored as the value of the textarea...
			let currentDraft = event.currentTarget.value;
			// Split the new text with a space into an array, and set the array length
			// as the value of the template variable, so the length of the current draft
			// in the textarea will be updated to the writing template.
			instances.essayLength.set(currentDraft.split(' ').length);
		}
	}
);