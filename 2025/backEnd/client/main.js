import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.body.events(
  {
    'click input#sayHi': function() {
      Meteor.call('sayHi');
    },
    'click input#printProfile': function() {
      // Inefficient!
      //let name = 'TY Chen', age = 77, dob = '1967-XX-XX', gender = 'Male', handedness = 'right';
      //Meteor.call('printProfile', name, age, dob, gender, handedness);
      let profile = {
        name: 'TY Chen',
        age: 77,
        dob: '1967-XX-XX',
        gender: 'Male',
        handedness: 'right'
      };
      Meteor.call('printProfile', profile);
    }
  }
);