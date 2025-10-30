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
			let usertype = event.currentTarget.id;
			instances.usertype = usertype;
		},
		'click #submitSignUp': function(event, instances) {
			Session.set('browseSession', 'signUpSuccess');
			let pwd = document.getElementById('password').value;
			let pwdConfirm = document.getElementById('passwordConfirm').value;
			if(pwd !== pwdConfirm) {
				alert('Re-type your password correctly.');
			}
			else {
				let finalProfile = {};
				finalProfile.username = document.getElementById('username').value;
				finalProfile.email = document.getElementById('username').value;
				finalProfile.password = document.getElementById('password').value;
				finalProfile.profile = {};
				finalProfile.profile.fullname = document.getElementById('fullname').value;
				finalProfile.profile.usertype = instances.usertype;
				Accounts.createUser(finalProfile, function(err) {
					if(err.error === 'no-create-user-login') {
						Session.set('browseSession', 'signUpSuccess');
					}
					else if(err.error === 403) {
						alert('Account already existed!');
						Session.set('browseSession', 'signIn');
					}
				});
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