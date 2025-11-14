import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './instructor-module.html';

Template.instructorHome.onCreated(
	function() {
		this.itemCat = new ReactiveVar('allItems');
		Session.setDefault('currentProjectID', '');
		Tracker.autorun(
			function() {
				Meteor.subscribe('writeProjects', Session.get('userSession'), Session.get('browseSession'));
			}
		);
	}
);

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

Template.instructorHome.events(
	{
		'click #createNewProject': function() {
			Session.set('browseSession', 'createProject');
		},
		'click input[type="radio"]': function(event, instances) {
			let newItemCat = event.currentTarget.id;
			instances.itemCat.set(newItemCat);
		},
		'click #logout': function() {
			Session.set('browseSession', 'frontPage');
			Session.set('userSession', '');
		},
		'click table > tbody td:first-of-type': function(event) {
			let projectID = event.currentTarget.id.replace('project_', '');
			Meteor.call('clearNewStatus', projectID, 'instructor');
			Session.set('currentProjectID', projectID);
			Session.set('browseSession', 'commenting');
		}
	}
);

Template.createProject.events(
	{
		'click #cancel': function() {
			Session.set('browseSession', 'instructorHome');
		},
		'click #submit': function() {
			let projectProfile = {
				title: document.getElementById('projectTitle').value.trim(),
				studentName: document.getElementById('studentName').value.trim(),
				instructions: document.getElementById('instructions').value.trim(),
				wordLimit: Number(document.getElementById('wordLimit').value)
			};
			Meteor.call('addNewProject', projectProfile);
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
		'click #save, click #saveAndQuit': function(event) {
			let commentDraft = document.getElementById('comments').value;
			Meteor.call('saveInstructorDraft', Session.get('currentProjectID'), commentDraft);
			alert('Draft saved!');
			if(event.currentTarget.id === 'saveAndQuit') {
				Session.set('browseSession', 'instructorHome');
				Session.set('currentProjectID', '');
			}
		},
		'click #quit': function() {
			Session.set('browseSession', 'instructorHome');
			Session.set('currentProjectID', '');
		},
		'click #submit, click #submitAndClose': function(event) {
			let submitType = event.currentTarget.id;
			if(confirm('Are you sure to submit your comments?')) {
				let commentDraft = document.getElementById('comments').value;
				Meteor.call('submitInstructorDraft', Session.get('currentProjectID'), commentDraft, submitType);
				Session.set('browseSession', 'instructorHome');
				Session.set('currentProjectID', '');
			}
		}
	}
);