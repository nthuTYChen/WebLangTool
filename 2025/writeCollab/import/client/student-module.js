import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import './student-module.html';

Template.studentHome.onCreated(function() {
	this.itemCat = new ReactiveVar('allItems');
	Tracker.autorun(
		function() {
			Meteor.subscribe('writeProjects', Session.get('userSession'), Session.get('browseSession'));
		}
	);
});

Template.studentHome.helpers(
	{
		writeProjects: function() {
			let currentItemCat = Template.instance().itemCat.get();
			if(currentItemCat === 'incompleteItems') {
				return writeProjectDB.find({status: 'incomplete'}, {sort: {createdAt: -1}});
			}
			else if(currentItemCat === 'completeItems') {
				return writeProjectDB.find({status: 'complete'}, {sort: {createdAt: -1}});
			}
			else if(currentItemCat === 'newItems') {
				return writeProjectDB.find({isNew: true}, {sort: {createdAt: -1}});
			}
			return writeProjectDB.find({}, {sort: {createdAt: -1}});
		}
	}
);

Template.studentHome.events(
	{
		'click #logout': function() {
			// Switch the browse session to "frontPage" after logging 
			// the user out.
			Session.set('browseSession', 'frontPage');
			// Set the user session to an empty string again after
			// logging out a user. With a real user-password system,
			// you will probably just need Meteor.logout().
			Session.set('userSession', '');
		},
		'click input[type="radio"]': function(event, instances) {
			let newItemCat = event.currentTarget.id;
			instances.itemCat.set(newItemCat);
		},
		'click table > tbody td:first-of-type': function(event) {
			Session.set('browseSession', 'writing');
		}
	}
);