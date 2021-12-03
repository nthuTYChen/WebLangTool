import { Tracker } from 'meteor/tracker';

import './user.html';

Template.user.helpers({
	userSession: function() {
		return Session.get('userSession');
	}
});

Template.userIndex.onCreated(function() {
	this.profile = {
		name: '',
		type: 'lecturer'
	};
	Tracker.autorun(function() {
		Meteor.subscribe('userProfile', Session.get('username'));
	});
});

Template.userIndex.helpers({
	lecturer: function() {
		let userProfile = userData.findOne();
		return userProfile && userProfile.name;
	},
	students: function() {
		let userProfile = userData.findOne();
		return userProfile && userProfile.students;
	}
});

Template.userIndex.events({
	'submit form': function(event) {
		event.preventDefault();
		let newProfile = Template.instance().profile;
		newProfile.name = document.getElementById('name').value;
		Session.set('username', newProfile.name);
		Meteor.call('serverWindow', {funcName: 'addUpdateProfile', info: newProfile});
	},
	'click button#addStudent': function() {
		let studentName = document.getElementById('studentName').value;
		Meteor.call('serverWindow', 
			{funcName: 'addStudentName', 
			 info: {
			 	studentName: studentName, 
			 	lecturerName: Session.get('username')
			 }
			}
		);
	},
	'click button#writing': function() {
		Session.set('userSession', 'writing');
	}
});

Template.writing.onCreated(function() {
	Tracker.autorun(function() {
		let username = Session.get('username');
		let studentName = Session.get('studentName');
		let projectName = Session.get('projectName');
		Meteor.subscribe('userData', username);
		Meteor.subscribe('writingProjects', studentName);
		Meteor.subscribe('studentWritings', studentName, projectName);
	});
});

Template.writing.helpers({
	students: function() {
		let userProfile = userData.findOne();
		return userProfile && userProfile.students;
	},
	allProjects: function() {
		return writingProjects.find({});
	},
	allWritings: function(title) {
		return studentWritings.find({project: title}, {sort: {createdAt: -1}});
	}
});

Template.writing.events({
	'change select': function(event) {
		let studentName = event.target.value;
		Session.set('studentName', studentName);
	},
	'click button#addProject': function() {
		let projectTitle = document.getElementById('newProject').value;
		let projectDes = document.getElementById('newProjectDes').value;
		Meteor.call('serverWindow',
			{
				funcName: 'addWritingProject', 
				info: {
					title: projectTitle,
					description: projectDes,
					lecturerName: Session.get('username'),
					studentName: Session.get('studentName')
				}
			}
		);
	},
	'click article': function(event) {
		let projectTitle = event.target.id;
		Session.set('projectName', projectTitle);
	},
	'click span': function(event) {
		let projectTitle = event.target.id;
		Meteor.call('serverWindow', 
			{
				funcName: 'removeWritingProject',
				info: {
					title: projectTitle,
					lecturerName: Session.get('username'),
					studentName: Session.get('studentName')
				}
			}
		);
	},
	'click article > section': function(event) {
 		event.stopPropagation();
 		let docId = event.target.id;
 		Session.set('writingID', docId);
 		Session.set('userSession', 'writingTools');
	},
	'click button#userIndex': function() {
		Session.set('userSession', 'userIndex');
		Session.set('studentName', '');
	}
});

Template.writingTools.onCreated(function() {
	Tracker.autorun(function() {
		Meteor.subscribe('studentWritingsById', Session.get('writingID'));
	});
});

Template.writingTools.helpers({
	writingRec: function(key) {
		let doc = studentWritings.findOne({_id: Session.get('writingID')});
		return doc && doc[key];
	}
});

Template.writingTools.events({
	'click button#submitNew': function() {
		let bodyTextarea = document.querySelector('p > textarea');
		let bodyTexts = bodyTextarea.value;
		Meteor.call('serverWindow', {
			funcName: 'submitReplyWriting',
			info: {
				project: Session.get('projectName'),
				texts: bodyTexts,
				type: 'lecturer',
				studentName: Session.get('studentName'),
				lecturerName: Session.get('username')
			}
		});
		Session.set('userSession', 'writing');
	},
	'click button#save': function() {
		let bodyTextareas = document.querySelectorAll('p > textarea');
		let comments = bodyTextareas[1].value;
		Meteor.call('serverWindow', {funcName: 'submitReplyWriting',
									 info: {
									 	id: Session.get('writingID'),
									 	comments: comments,
									 	save: true
									 }}
		);
		Session.set('userSession', 'writing');
	},
	'click button#backToProjects': function() {
		Session.set('userSession', 'writing');
	}
});