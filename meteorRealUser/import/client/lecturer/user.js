import './user.html';

Template.userHome_Lecturer.helpers({
	username: function() {
		let userData = Meteor.user();
		return userData && userData.profile.realName;
	},
	userSession: function() {
		return Session.get('userSession');
	}
});

Template.userHome_Lecturer.events({
	'click button#listening': function() {
 		Session.set('userSession', 'listening_Lecturer');
	},
 	'click button#logout': function() {
 		Meteor.logout();
 		Session.set('browseSession', 'welcome');
 	}
});

Template.userIndex_Lecturer.helpers({
 	profile: function(key) {
 		let userData = Meteor.user();
 		return userData && userData.profile[key];
 	}
});

Template.listening_Lecturer.events({
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
		Session.set('userSession', 'userIndex_Lecturer');
	}
});