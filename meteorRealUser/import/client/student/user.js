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
	'click button': function() {
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