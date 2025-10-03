import { Mongo } from 'meteor/mongo';

import './main.html';

global.userData = new Mongo.Collection('userData');

Template.body.onCreated(function() {
		Meteor.subscribe('userProfile', 'WWW');
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
		'click input#updateSampleProfile': function() {
			Meteor.call('updateProfile');
		}
	}
);