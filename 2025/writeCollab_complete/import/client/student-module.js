import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './student-module.html';

Template.studentHome.onCreated(
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

Template.studentHome.helpers(
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

Template.studentHome.events(
	{
		'click #logout': function() {
			Session.set('browseSession', 'frontPage');
			Session.set('userSession', '');
		},
		'click input[type="radio"]': function(event, instances) {
			let newItemCat = event.currentTarget.id;
			instances.itemCat.set(newItemCat);
		},
		'click table > tbody td:first-of-type': function(event) {
			let projectID = event.currentTarget.id.replace('project_', '');
			Meteor.call('clearNewStatus', projectID, 'student');
			Session.set('currentProjectID', projectID);
			Session.set('browseSession', 'writing');
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
		compReadonly: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.status === 'complete') {
				return 'readonly';
			}
			return '';
		},
		essayLength: function() {
			let currentProject = writeProjectDB.findOne();
			let currentEssayLength = Template.instance().essayLength;
			if(currentProject && currentProject.essay && currentEssayLength.get() === 0) {
				currentEssayLength.set(currentProject.essay.split(' ').length);
			}
			return currentEssayLength.get();
		},
		projectInfo: function(key) {
			let currentProject = writeProjectDB.findOne();
			return currentProject && currentProject[key];
		},
		isWithComments: function() {
			let currentProject = writeProjectDB.findOne();
			if(currentProject && currentProject.comments) {
				return true;
			}
			return false;
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

Template.writing.events(
	{
		'click #save, click #saveAndQuit': function(event) {
			let essayDraft = document.getElementById('essay').value;
			Meteor.callAsync('saveStudentDraft', Session.get('currentProjectID'), essayDraft).then(
				function() {
					alert('Draft saved!');
					if(event.currentTarget.id === 'saveAndQuit') {
						Session.set('browseSession', 'studentHome');
						Session.set('currentProjectID', '');
					}
				}
			).catch(
				function(err) {
					alert(err.reason);
				}
			);
		},
		'click #quit': function() {
			Session.set('browseSession', 'studentHome');
			Session.set('currentProjectID', '');
		},
		'click #submit': function() {
			if(confirm('Are you sure to submit this draft?')) {
				let essayDraft = document.getElementById('essay').value;
				Meteor.callAsync('submitStudentDraft', Session.get('currentProjectID'), essayDraft).then(
					function() {
						Session.set('browseSession', 'studentHome');
						Session.set('currentProjectID', '');
					}
				).catch(
					function(err) {
						alert(err.reason);
					}
				);
			}
		},
		'keyup #essay': function(event, instances) {
			let currentDraft = event.currentTarget.value;
			instances.essayLength.set(currentDraft.split(' ').length);
		}
	}
);