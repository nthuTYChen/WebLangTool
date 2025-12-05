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

// Publish writeProjectDB as "singleWriteProject" based on the project ID
// and the user identity. Since every document has a unique ID, it will
// at most publish ONE matching document.
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
		// Set the "isNew" key of a matching project document to be FALSE, so the
		// title of a project does not include the "New!" string. See /import/client/student-module.html
		// and /import/client/student-module.js
		clearNewStatus: function(projectID, identity) {
			writeProjectDB.updateAsync({_id: projectID, target: identity}, {$set: {isNew: false}});
		},
		// Save the essay draft for a student based on a target project ID and essay received from
		// the user.
		saveStudentDraft: async function(projectID, essay) {
			// Since this is a student's project, the target must match 'student'.
			// We need "await" here, so we can wait for the document returned from "findOneAsync".
			let targetProject = await writeProjectDB.findOneAsync({_id: projectID, target: 'student'});
			// Do something only if targetProject has something (i.e., NOT undefined).
			if(targetProject) {
				// Split the essay draft with a space and check if the word count exceeds the wordLimit
				// set to the project.
				if(essay.split(' ').length > targetProject.wordLimit) {
					// If so, throw an error back to the client. The first string is the name of the
					// error, and the second string is the message of the error. The server method
					// stops here if an error is thrown.
					throw new Meteor.Error('essay-too-long', 'The length of essay exceeds the limit.');
				}
				// If the word count does not exceed the word limit, save the draft. 
				else {
					await writeProjectDB.updateAsync({_id: projectID, target: 'student'}, 
						{$set: {essay: essay}});
				}
			}
			// Return a "normal" response to the client if there's no error thrown above.
			return;
		},
		// Save the project ID and comments from an instructor. This is not an asynchronous function
		// since nothing waits for the result of an asynchronous action.
		saveInstructorDraft: function(projectID, comments) {
			// Update the comments to an instructor project based on the project ID
			writeProjectDB.updateAsync({_id: projectID, target: 'instructor'}, {$set: {comments: comments}});
			// Return a normal response
			return;
		},
		// A draft submitted by a student for a project
		submitStudentDraft: async function(projectID, essay) {
			// Find the current student project based on the project ID. Wait for the result so the
			// matched document (if any) could be stored to "targetProject".
			let targetProject = await writeProjectDB.findOneAsync({_id: projectID, target: 'student'});
			// Do the rest if there is indeed a target project (i.e., targetProject !== undefined)
			if(targetProject) {
				// Split the essay draft into separate words by space and check if the number of words
				// is higher than the word limit in the target project.
				if(essay.split(' ').length > targetProject.wordLimit) {
					// If so, throw an error message.
					throw new Meteor.Error('essay-too-long', 'The length of essay exceeds the limit.');
				}
				// If the word count is within the limit...
				else {
					// Update the essay to the target student project by the project ID,
					// set the project to be complete, and add the date of completion
					await writeProjectDB.updateAsync({_id: projectID, target: 'student'},
						{$set: {essay: essay, status: 'complete', completedAt: new Date()}});
					// Create a copy of the target project document as the new instructor project
					let newInstructorProject = targetProject;
					// Remove the _id key since document ID will be automatically assigned by
					// MongoDB upon insertion.
					delete newInstructorProject._id;
					// Change the target user identity
					newInstructorProject.target = 'instructor';
					// Add the student's essay to the new project for the instructor
					newInstructorProject.essay = essay;
					// Add the comment key for the instructor project
					newInstructorProject.comments = '';
					// Make the new project "new"
					newInstructorProject.isNew = true;
					// Reset the time of creation for the new project
					newInstructorProject.createdAt = new Date();
					// Insert the new project to the collection
					await writeProjectDB.insertAsync(newInstructorProject);
				}
			}
			return;
		},
		// Very similar with "submitStudentDraft" above, except with a few changes.
		// The method receives current project ID, comments from an instructor, and the
		// type of submission (submit vs. submit and close)
		submitInstructorDraft: async function(projectID, comments, type) {
			// Find the current target project document as well based on the project ID
			// to create a copy for the new student project.
			let newStudentProject = await writeProjectDB.findOneAsync({_id: projectID, target: 'instructor'});
			// Update the instructor project to set the comments, change the status to be complete,
			// set the date of completion.
			writeProjectDB.updateAsync({_id: projectID, target: 'instructor'},
				{$set: {comments: comments, status: 'complete', completedAt: new Date()}});
			delete newStudentProject._id;
			// Change the target user to be the student
			newStudentProject.target = 'student';
			// Add the comments for the student
			newStudentProject.comments = comments;
			// Increase the version number by 1
			newStudentProject.version++;
			newStudentProject.isNew = true;
			newStudentProject.createdAt = new Date();
			// If the instructor also choose to close the project...
			if(type === 'submitAndClose') {
				// Set this "new" student project to be complete, so the student
				// cannot submit a new essay
				newStudentProject.status = 'complete';
				// Set the time of completion.
				newStudentProject.completedAt = new Date();
			}
			// Insert the new student project to the collection.
			writeProjectDB.insertAsync(newStudentProject);
			return;
		}
	}
);