// Just load account-module.html when this file is imported in
// /client/main.js.
import { Accounts } from 'meteor/accounts-base';

import './account-module.html';

Template.signUp.onCreated(
	function() {
		this.usertype = 'student';
	}
);

Template.signUp.events(
	{
		'click #backHome': function() {
			Session.set('browseSession', 'signIn');
		},
		'click .usertype': function(event, instances) {
			let newUsertype = event.currentTarget.id;
			instances.usertype = newUsertype;
		},
		'click #submitSignUp': function(event, instances) {
			let pwd = document.getElementById('password').value;
			let pwdConfirm = document.getElementById('passwordConfirm').value;
			if(pwd !== pwdConfirm) {
				alert('Re-type your password correctly!');
			}
			else {
				let finalProfile = {};
				finalProfile.username = document.getElementById('username').value;
				finalProfile.email = document.getElementById('username').value;
				finalProfile.password = pwd;
				finalProfile.profile = {};
				finalProfile.profile.fullname = document.getElementById('fullname').value;
				finalProfile.profile.usertype = instances.usertype;
				//console.log(finalProfile);
				Accounts.createUser(finalProfile, 
					function(err) {
						//console.log(err);
						if(err.error === 'no-create-user-login') {
							Session.set('browseSession', 'signUpSuccess');
						}
						else if(err.error === 403) {
							alert('Account already exists!');
							Session.set('browseSession', 'signIn');
						}
					}
				);
			}
		}
	}
);

Template.signUpSuccess.events(
	{
		'click #backHome': function() {
			Session.set('browseSession', 'signIn');
		}
	}
);

Template.verifySuccess.events(
	{
		'click #backHome': function() {
			Session.set('browseSession', 'signIn');
		}
	}
);

Template.verifyFailed.events(
	{
		'click #backHome': function() {
			Session.set('browseSession', 'signIn');
		}
	}
);