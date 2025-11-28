// Import the Mongo package
import { Mongo } from 'meteor/mongo';

// Create a global variable that refers to the server "writeProjectDB"
// collection.
global.writeProjectDB = new Mongo.Collection('writeProjectDB');

// Publish writeProjectDB as "writeProjects" based on the user identity
// and browse session submitted from the client.
Meteor.publish('writeProjects', function(identity, browseSession) {
	// Only publish documents when the browse session includes "Home"
	// (i.e., studentHome or instructorHome)
	if(browseSession.includes('Home')) {
		// Publish student/instructor documents based on the user identity.
		return writeProjectDB.find({target: identity});
	}
});

Meteor.publish('singleWriteProject', function(projectID, identity) {
	return writeProjectDB.find({_id: projectID, target: identity});
});

Meteor.startup(function() {

});

// Server methods
Meteor.methods(
	{
		// Add a new project by an instructor
		addNewProject: function(projectProfile) {
			// The keys that are added directly on the server side
			projectProfile.version = 1; // Version start with 1 for a new project
			// With a real user-password system, the instructor name could be
			// directly retrieved from a user profile.
			projectProfile.instructor = 'TYC';
			// A new project is certainly an incomplete project.
			projectProfile.status = 'incomplete';
			// A new project is created for a student.
			projectProfile.target = 'student';
			// Add the timestamp for project creation.
			projectProfile.createdAt = new Date();
			// Add a key for storing the time of completion in advance.
			// The value is null because the key stores "nothing" now.
			projectProfile.completedAt = null;
			// A new project is "new" for sure, so set "isNew" to TRUE.
			projectProfile.isNew = true;
			// Insert the final project profile
			writeProjectDB.insertAsync(projectProfile);
		},
		clearNewStatus: function(projectID, identity) {
			writeProjectDB.updateAsync({_id: projectID, target: identity}, {$set: {isNew: false}});
		},
		saveStudentDraft: async function(projectID, essay) {
			let targetProject = await writeProjectDB.findOneAsync({_id: projectID, target: 'student'});
			if(targetProject) {
				if(essay.split(' ').length > targetProject.wordLimit) {
					throw new Meteor.Error('essay-too-long', 'The length of essay exceeds the limit.');
				}
				else {
					await writeProjectDB.updateAsync({_id: projectID, target: 'student'}, 
						{$set: {essay: essay}});
				}
			}
			return;
		}
	}
);