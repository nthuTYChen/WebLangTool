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
		// When the title column of each project is clicked,
		// navigate the student to the "writing" template.
		'click table > tbody td:first-of-type': function(event) {
			let projectID = event.currentTarget.id.replace('project_', '');
			Meteor.call('clearNewStatus', projectID, 'student');
			Session.set('browseSession', 'writing');
			Session.set('currentProjectID', projectID);
		}
	}
);

Template.writing.onCreated(
	function() {
		this.essayLength = new ReactiveVar(0);
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
		essayLength: function() {
			let currentEssayLength = Template.instance().essayLength;
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.essay && currentEssayLength.get() === 0) {
				currentEssayLength.set(currentProject.essay.split(' ').length);
			}
			return currentEssayLength.get();
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
		},
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
		'click #save, click #saveAndQuit': function(event) {
			let essayDraft = document.getElementById('essay').value;
			Meteor.callAsync('saveStudentDraft', 
				Session.get('currentProjectID'), essayDraft).then(function() {
					alert('Draft Saved!');
					if(event.currentTarget.id === 'saveAndQuit') {
						Session.set('browseSession', 'studentHome');
						Session.set('currentProjectID', '');
					}
				}).catch(function(err) {
					alert(err.reason);
				});
		},
		'click #quit': function() {
			Session.set('browseSession', 'studentHome');
			Session.set('currentProjectID', '');
		},
		'keyup #essay': function(event, instances) {
			let currentDraft = event.currentTarget.value;
			instances.essayLength.set(currentDraft.split(' ').length);
		}
	}
);