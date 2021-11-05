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
	}
});