import { Meteor } from 'meteor/meteor';

import '/import/server/databases.js';
import serverFunc from '/import/server/serverFunc.js';

Meteor.startup(function () {
  // code to run on server at startup
  //userData.insert({name: 'TYC', type: 'student', gender: 'male', age: 40});
  //userData.update({name: 'TYC', type: 'student'}, {$set: {gender: 'female', age: 30, handedness: 'right'}});
  //userData.remove({name: 'ABC'});
  // Upsert = Update + Insert
  /* userData.update(
      {name: 'ABC', type: 'lecturer'}, // Selector
      {$set: {gender: 'female', age: 40}, $setOnInsert: {createdAt: new Date()}}, // Action taken
      {upsert: true}
    ); // Option */
});

// Meteor (Server) Methods
Meteor.methods({
  serverWindow: function(data) {
    //serverFunc.testFuncCall();
    //serverFunc['testFuncCall']();
    let result = serverFunc[data.funcName](data.info);
    return result;
  }
});