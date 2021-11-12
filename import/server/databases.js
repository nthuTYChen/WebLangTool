import { Mongo } from 'meteor/mongo';

// Global variable
userData = new Mongo.Collection('userData');
ansRecords = new Mongo.Collection('ansRecords');
writingProjects = new Mongo.Collection('writingProjects');
studentWritings = new Mongo.Collection('studentWritings');

Meteor.publish('userProfile', function(username) {
	return userData.find({name: username});
});

Meteor.publish('writingProjects', function(studentName) {
	return writingProjects.find({student: studentName});
});

Meteor.publish('studentWritings', function(studentName, projectTitle) {
	return studentWritings.find({student: studentName, project: projectTitle});
});