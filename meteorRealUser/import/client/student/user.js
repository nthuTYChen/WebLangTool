import { Tracker } from 'meteor/tracker';

import './user.html';

Template.userHome.helpers({
	realName: function() {
 		return Meteor.user() && Meteor.user().profile.realName;
	},
	userSession: function() {
		return Session.get('userSession');
	}
});

Template.userHome.events({
	'click button#listening': function() {
 		Session.set('userSession', 'listening');
	},
	'click button#logout': function() {
		Meteor.logout();
		Session.set('browseSession', 'welcome');
	}
});

Template.userIndex.helpers({
	username: function() {
		return Meteor.user() && Meteor.user().username;
	},
	profile: function(key) {
		let userData = Meteor.user();
		return userData && userData.profile[key];
	}
});

Template.listening.onCreated(function() {
 	Tracker.autorun(function() {
 		Meteor.subscribe('listeningTasks');
 	});
});

Template.listening.helpers({
	tasks: function() {
		return listeningTasks.find({});
	}
});

Template.listening.events({
	'click button': function() {
		Session.set('userSession', 'userIndex');
	}
});