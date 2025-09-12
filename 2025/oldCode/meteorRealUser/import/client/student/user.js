import { Tracker } from 'meteor/tracker';

import './user.html';

Template.userHome_Student.helpers({
	realName: function() {
 		return Meteor.user() && Meteor.user().profile.realName;
	},
	userSession: function() {
		return Session.get('userSession');
	}
});

Template.userHome_Student.events({
	'click button#listening': function() {
 		Session.set('userSession', 'listening_Student');
	},
	'click button#logout': function() {
		Meteor.logout();
		Session.set('browseSession', 'welcome');
	}
});

Template.userIndex_Student.helpers({
	username: function() {
		return Meteor.user() && Meteor.user().username;
	},
	profile: function(key) {
		let userData = Meteor.user();
		return userData && userData.profile[key];
	}
});

Template.listening_Student.onCreated(function() {
 	Tracker.autorun(function() {
 		Meteor.subscribe('listeningTasks');
 	});
});

Template.listening_Student.helpers({
	tasks: function() {
		return listeningTasks.find({});
	}
});

Template.listening_Student.events({
	'click button': function() {
		Session.set('userSession', 'userIndex_Student');
	}
});