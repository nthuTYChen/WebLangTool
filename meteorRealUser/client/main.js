import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './lib/session.js';
import './main.html';

Template.index.helpers({
	browseSession: function() {
		return Session.get('browseSession');
	}
});

Template.welcome.events({
	'click button#signUp': function() {
		Session.set('browseSession', 'signUp');
	}
});

Template.signUp.onCreated(function() {
 	this.regInfo = {
 		username: null,
 		password: null,
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