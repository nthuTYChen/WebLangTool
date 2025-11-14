import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

global.questionDB = new Mongo.Collection('questionDB');
global.userDataDB = new Mongo.Collection('userDataDB');

Session.setDefault('browseSession', 'index');
Session.setDefault('username', '');

Template.body.onCreated(function() {
  Meteor.subscribe('allQuestions');
  Tracker.autorun(
    function() {
      Meteor.subscribe('userData', Session.get('username'));
    }
  );
});

Template.body.helpers(
  {
    browseSession: function() {
      return Session.get('browseSession');
    }
  }
);

Template.index.events(
  {
    'click input#signin': function() {
      Session.set('browseSession', 'learning');
      let username = document.getElementById('username').value;
      Session.set('username', username);
      Meteor.call('addUser', username);
    }
  }
);

Template.learning.onCreated(function() {
  this.answers = [];
});

Template.learning.helpers(
  {
    questions: function() {
      let qs = questionDB.find().fetch();
      let qs_ord = _.shuffle(qs);
      return qs_ord;
    }
  }
);

Template.learning.events(
  {
    'click input[type="radio"]': function(event, instances) {
      let questionId = event.currentTarget.name;
      questionId = questionId.replace('id_', '');
      let optionText = event.currentTarget.value;
      let answerObj = {
        id: questionId,
        answer: optionText
      }
      if(instances.answers.length === 0) {
        instances.answers.push(answerObj);
      }
      else {
        for(let index=0 ; index < instances.answers.length ; index++) {
          let currentAns = instances.answers[index];
          if(currentAns.id === answerObj.id) {
            instances.answers[index].answer = answerObj.answer;
            break;
          }
          else if(index === instances.answers.length - 1) {
            instances.answers.push(answerObj);
          }
        }
      }
      console.log(instances.answers);
    },
    'click input#submitAns': function(event, instances) {
      let allAns = instances.answers;
      // Meteor call
      Meteor.call('validateAns', allAns, Session.get('username'));
      instances.answers = [];
    }
  }
);