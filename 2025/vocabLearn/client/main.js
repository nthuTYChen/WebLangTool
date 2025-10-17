import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

global.questionDB = new Mongo.Collection('questionDB');

Session.setDefault('browseSession', 'index');

Template.body.onCreated(function() {
  Meteor.subscribe('allQuestions');
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
    }
  }
);