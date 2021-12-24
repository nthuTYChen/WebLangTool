import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './lib/session.js';
import './lib/databases.js';
import './main.html';

Template.body.onCreated(function() {
	let verifyToken = Accounts._verifyEmailToken;
	// Start the verification process only when there's a verification token
	if(verifyToken) {
		Accounts.verifyEmail(verifyToken, function(error) {
			if(error.reason === 'Login forbidden') {
				Session.set('browseSession', 'successfulVerify');
			}
 			else if(error) {
 				alert('Invalid verification link!');
 			}
 			else {
 				Session.set('browseSession', 'successfulVerify');
 			}
		});
	}
});

Template.index.helpers({
	userHome: function() {
		return Session.get('browseSession');
	},
	browseSession: function() {
		return Session.get('browseSession');
	}
});

Template.welcome.events({
	'click button#signIn': function() {
 		Session.set('browseSession', 'signIn');
	},
	'click button#signUp': function() {
		Session.set('browseSession', 'signUp');
	}
});

Template.signUp.onCreated(function() {
 	this.regInfo = {
 		username: null,
 		password: null,
 		email: null,
 		profile: {
 			realName: null,
 			age: null,
 			gender: null,
 			type: null
 		}
 	};
});

Template.signUp.events({
	'click input[type="radio"]': function(event, instances) {
		let infoKey = event.target.name;
		let infoValue = event.target.value;	
		instances.regInfo.profile[infoKey] = infoValue;
	},
	'submit form': function(event, instances) {
		event.preventDefault();
		let realName = document.getElementById('name').value;
		let age = Number(document.getElementById('age').value);
		let email = document.getElementById('email').value;
		let password = document.getElementById('password').value;
		let regInfo = instances.regInfo;
		regInfo.profile.realName = realName;
		regInfo.profile.age = age;
		regInfo.username = email;
		regInfo.email = email;
		regInfo.password = password;
		Accounts.createUser(regInfo, function(error) {
			if(error) {
				if(error.reason === 'Login forbidden') {
					Session.set('browseSession', 'signedUp');
				}
				else if(error.error === 403) {
					alert('email existed!');
				}
				else {
					alert('something went wrong!');
				}
			}
			else {
				Session.set('browseSession', 'signedUp');
			}
		});
	}
});

Template.successfulVerify.events({
	'click button': function() {
 		Session.set('browseSession', 'signIn');
	},
});

Template.signIn.events({
	'submit form': function(event) {
 		event.preventDefault();
 		let username = document.getElementById('username').value;
 		let password = document.getElementById('password').value;

 		Meteor.loginWithPassword(username, password, function(error) {
 			if(error) {
 				alert('Incorrect username/password!');
 			}
 			else {
 				let userData = Meteor.user();
				// Try to import different files and set the session variables 
				// to load defaul user templates only when a user is logged in
				if(userData) {
					if(userData.profile.type === 'student') {
						import('/import/client/student/user.js').then(function() {
							Session.set('userSession', 'userIndex_Student');
							Session.set('browseSession', 'userHome_Student');
						});
					}
					else {
						import('/import/client/lecturer/user.js').then(function() {
							Session.set('userSession', 'userIndex_Lecturer');
							Session.set('browseSession', 'userHome_Lecturer');
						});
					}
				}
 			}
 		});
	}
});
