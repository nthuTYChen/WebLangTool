import { Meteor } from 'meteor/meteor';

Meteor.startup(
  // ()=>{};
  function () {
    // code to run on server at startup
    console.log('Meteor app is running!');
  }
);

Meteor.methods(
  {
    sayHi: function() {
      console.log('Hi! I am called from a Web browser!');
    },
    printProfile: function(profile) {
      console.log(profile.name);
      console.log(profile.age);
      console.log(profile.dob);
    },
    profileResp: function(profile) {
      console.log('Called by ' + profile.name);
      return 'done!';
    },
    errorResp: function(profile) {
      if(profile.name) {
        console.log('Called by ' + profile.name);
      }
      else {
        throw new Meteor.Error('No name info!');
      }
      return 'done!';
    }
  }
);
