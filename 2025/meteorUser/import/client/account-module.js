import { Accounts } from 'meteor/accounts-base';

// Load account-module.html when this file is imported in
// /client/main.js, so all the templates in account-module.html
// are ready to be loaded dynamically.
import './account-module.html';

// When the "signUp" template is loaded, create a template variable
// "usertype", which is set to "student" by default to match the
// default radio button selection in the template.
Template.signUp.onCreated(
	function() {
		this.usertype = 'student';
	}
);

// Event listeners for the "signUp" template.
Template.signUp.events(
	{
		// Simply navigate the users back to the home page
		// when clicking on the "backHome" button.
		'click #backHome': function() {
			Session.set('browseSession', 'signIn');
		},
		// Clicking events for the "usertype" class radio buttons
		'click .usertype': function(event, instances) {
			// Get the ID of the clicked radio button ("student"
			// or "instructor").
			let newUsertype = event.currentTarget.id;
			// Save the ID to the template variable to be the new
			// user type.
			instances.usertype = newUsertype;
		},
		// When clicking on the submit button...
		'click #submitSignUp': function(event, instances) {
			// Get the password from the sign-up form
			let pwd = document.getElementById('password').value;
			// Get the re-typed password from the sign-up form.
			let pwdConfirm = document.getElementById('passwordConfirm').value;
			// Check if the password is re-typed correctly, and if not...
			if(pwd !== pwdConfirm) {
				// Show a warning message.
				alert('Re-type your password correctly!');
			}
			// If the password is re-typed correctly...
			else {
				// Set up the final user profile object, starting with an
				// empty object.
				let finalProfile = {};
				// The three top-level keys must be username (same as the
				// email), email, and password.
				finalProfile.username = document.getElementById('username').value;
				finalProfile.email = document.getElementById('username').value;
				finalProfile.password = pwd;
				// Other information is stored to the second-level "profile"
				// object, so create an empty object first.
				finalProfile.profile = {};
				// The full name and user type go to "profile".
				finalProfile.profile.fullname = document.getElementById('fullname').value;
				finalProfile.profile.usertype = instances.usertype;
				//console.log(finalProfile);
				// Submit the user profile to the server to create a new user
				// via createUser().
				Accounts.createUser(finalProfile, 
					// createUser() runs a callback function that receives
					// potential error messages sent back from the user.
					function(err) {
						//console.log(err);
						// If the error type is "no-create-user-login",
						// it means the registration is complete. It's
						// just that the user is not logged in automatically.
						// (see /server/main.js)
						if(err.error === 'no-create-user-login') {
							// In this case, switch the browse session to
							// "signUpSuccess" and load the template.
							Session.set('browseSession', 'signUpSuccess');
						}
						// If the error type is "403", something went wrong
						// during the registration process. In the current
						// demo, it simply means that the email is already
						// registered in the online database.
						else if(err.error === 403) {
							// In this case, show a warning message...
							alert('Account already exists!');
							// ...and navigate the user back to the home page.
							Session.set('browseSession', 'signIn');
						}
					}
				);
			}
		}
	}
);

// For the templates "signUpSuccess", "verifySuccess", "verifyFailed",
// simply set up an event listener for the functionally identical
// "backHome" button.
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