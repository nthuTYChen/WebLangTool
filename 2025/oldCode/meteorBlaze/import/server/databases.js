import { Mongo } from 'meteor/mongo';

// Global variable
global.userData = new Mongo.Collection('userData');
global.ansRecords = new Mongo.Collection('ansRecords');
global.writingProjects = new Mongo.Collection('writingProjects');
global.studentWritings = new Mongo.Collection('studentWritings');

Meteor.publish('userProfile', function(username) {
	return userData.find({name: username});
});

Meteor.publish('writingProjects', function(studentName) {
	return writingProjects.find({student: studentName});
});

Meteor.publish('studentWritings', function(studentName, projectTitle) {
	return studentWritings.find({student: studentName, project: projectTitle}, 
								{fields: {texts: 0, comments: 0}}
	);
});

Meteor.publish('studentWritingsById', function(id) {
	return studentWritings.find({_id: id});
});