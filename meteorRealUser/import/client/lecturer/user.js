import './user.html';

Template.userHome.helpers({
	username: function() {
		let userData = Meteor.user();
		return userData && userData.profile.realName;
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
 	profile: function(key) {
 		let userData = Meteor.user();
 		return userData && userData.profile[key];
 	}
});

Template.listening.events({
	'submit form': function(event) {
 		event.preventDefault();
 		let title = document.getElementById('title').value;
 		let description = document.getElementById('description').value;
 		let filename = document.getElementById('filename').value;
 		Meteor.call('serverWindow', {
 			funcName: 'addListeningTask', 
 			info: {
 				title: title,
 				description: description,
 				filename: filename
 			}
 		});
	},
	'click button#home': function() {
		Session.set('userSession', 'userIndex');
	}
});