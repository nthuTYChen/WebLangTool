import './user-module.html';

Template.userHome.helpers(
	{
		fullname: function() {
			let userData = Meteor.user();
			return userData.profile.fullname;
		},
		userProfile: function(key) {
			let userData = Meteor.user();
			return userData[key];
		}
	}
);

Template.userHome.events(
	{
		'click #logout': function() {
			Meteor.logout();
			Session.set('browseSession', 'signIn');
		}
	}
);