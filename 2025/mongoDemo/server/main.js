import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// Global variabe
global.userData = new Mongo.Collection('userData');

Meteor.startup(function() {
  /*userData.insertAsync(
      {
        name: 'TY Chen',
        type: 'instructor',
        gender: 'male',
        age: 77
      }
    );*/
});

Meteor.publish('userProfile', function(username) {
  return userData.find(
    {name: username}
  );
});

Meteor.methods(
  {
    removeUserData: function() {
      userData.removeAsync({});
    },
    insertSampleProfile: function() {
      userData.upsertAsync(
        {name: 'TYC', type: 'student'},
        {$set: {gender: 'male', age: 24}},
        {multi: true}
      );
    },
    insertAnotherProfile: function() {
      userData.upsertAsync(
        {name: 'Kelly', type: 'instructor'},
        {$set: {gender: 'female', age: 54}},
        {multi: true}
      );
    },
    updateProfile: function() {
      userData.updateAsync(
        {name: 'Nicky', type: 'student'},
        {$set: {gender: 'unknown', age: 'unknown'}},
        {multi: true}
      );
    }
  }
);
