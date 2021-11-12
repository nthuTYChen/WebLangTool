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
	}
});

Template.writing.events({
	'change select': function(event) {
		let studentName = event.target.value;
		Session.set('studentName', studentName);
	},
	'click button#addProject': function() {
		let projectTitle = document.getElementById('newProject').value;
		Meteor.call('serverWindow',
			{
				funcName: 'addWritingProject', 
				info: {
					title: projectTitle,
					lecturerName: Session.get('username'),
					studentName: Session.get('studentName')
				}
			}
		);
	},
	'click button#userIndex': function() {
		Session.set('userSession', 'userIndex');
		Session.set('studentName', '');
	}
});