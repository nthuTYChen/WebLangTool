import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import './main.html';

global.userData = new Mongo.Collection('userData');

Template.body.onCreated(function() {
		this.username = new ReactiveVar('');
		let usernameReactVar = this.username;
		Tracker.autorun(function() {
			Meteor.subscribe('userProfile', usernameReactVar.get());
		});
	}
);

Template.body.helpers(
	{
		profileInfo: function(key) {
			let userProfile = userData.findOne();
			if(userProfile) {
				return userProfile[key];
			}
			return 'None';
		}
	}
);

Template.body.events(
	{
		'click input#removeAllUserData': function () {
			Meteor.call('removeUserData');
		},
		'click input#addSampleProfile': function() {
			Meteor.call('insertSampleProfile');
		},
		'click input#addAnotherProfile': function() {
			Meteor.call('insertAnotherProfile');
		},
		'click input#updateSampleProfile': function() {
			Meteor.call('updateProfile');
		},
		'click input#submitUsername': function(event, instances) {
			let usernameObj = document.getElementById('username');
			let newUserName = usernameObj.value;
			usernameObj.value = '';
			instances.username.set(newUserName);
			console.log(instances.username.get());
		}
	}
);