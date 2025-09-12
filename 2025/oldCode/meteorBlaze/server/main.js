import { Meteor } from 'meteor/meteor';

import '/import/server/databases.js';
import serverFunc from '/import/server/serverFunc.js';

Meteor.startup(function () {
  
});

// Meteor (Server) Methods
Meteor.methods({
  serverWindow: async function(data) {
    //serverFunc.testFuncCall();
    //serverFunc['testFuncCall']();
    let result = await serverFunc[data.funcName](data.info);
    return result;
  }
});