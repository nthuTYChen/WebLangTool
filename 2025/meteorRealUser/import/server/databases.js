import { Mongo } from 'meteor/mongo';

listeningTasks = new Mongo.Collection('listeningTasks');

Meteor.publish('listeningTasks', function() {
 	let userId = this.userId; // this = current user
 	// Return all listening tasks only when a user is logged in.
 	if(userId) {
 		return listeningTasks.find({});
 	}
 	return;
});