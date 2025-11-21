/* Nov 15, 2025 - Nothing is done on the server side just yet. */

import { Mongo } from 'meteor/mongo';

global.writeProjectDB = new Mongo.Collection('writeProjectDB');

Meteor.publish('writeProjects', function(identity, browseSession) {
	if(browseSession.includes('Home')) {
		return writeProjectDB.find({target: identity});
	}
});

Meteor.startup(function() {

});

Meteor.methods(
	{
		addNewProject: function(projectProfile) {
			console.log(projectProfile);
			projectProfile.version = 1;
			projectProfile.instructor = 'TYC';
			projectProfile.status = 'incomplete';
			projectProfile.target = 'student';
			projectProfile.createdAt = new Date();
			projectProfile.completedAt = null;
			projectProfile.isNew = true;
			writeProjectDB.insertAsync(projectProfile);
		}
	}
);