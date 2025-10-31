/* Oct 31, 2025 - To begin with, please make sure that you've installed the
   following packages to this new Meteor demo application: session, reactive-var, underscore.
   Then, please remember to create a private directory with "multipleChoiceSample.txt"
   file inside.
*/

import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

// Create a local copy of the questionDB/userDataDB collection.
global.questionDB = new Mongo.Collection('questionDB');
global.userDataDB = new Mongo.Collection('userDataDB');

// Set a session variable with a default value of 'index'. 
// This variable is for loading different templates.
Session.setDefault('browseSession', 'index');
// Set a session variable with a default value of ''. 
// This variable is for storing a username.
Session.setDefault('username', '');

Template.body.onCreated(function() {
  // When the 'body' template is created, subscribe to the
  // allQuestions publication defined in /server/main.js.
  Meteor.subscribe('allQuestions');
  /* Subscribe the userData publication with the current username.
     This subscription has to be placed inside Tracker.autorun(),
     so data subscription is updated when there's a change in the
     reactive element (e.g., from '' to a real username for the
     session variable). */
  Tracker.autorun(function() {
    Meteor.subscribe('userData', Session.get('username'));
  });
});

// Define the browseSession helper to return the value
// of the session variable to the Web page.
Template.body.helpers(
  {
    browseSession: function() {
      return Session.get('browseSession');
    }
  }
);

// For the index template defined in /client/main.html,
// create an event listener for the <input id="signin"> 
// element.
Template.index.events(
  {
    'click input#signin': function() {
      // For now, clicking the Sign In button only changes
      // the value of the browseSession session variable
      // to 'learning', which helps load the 'learning'
      // template.
      Session.set('browseSession', 'learning');
      // Get the username from the Web interface, and store it
      // to the session variable.
      let username = document.getElementById('username').value;
      Session.set('username', username);
      // Call the server method to add a new user profile, if the
      // username is new.
      Meteor.call('addUser', username);
    }
  }
);

// When the 'learning' template defined in /client/main.html
// is created/loaded, create a template variable 'answers'
// as an empty array for storing temporary answers.
Template.learning.onCreated(function() {
  this.answers = [];
});

Template.learning.helpers(
  {
    // For the 'learning' template, create the 'questions'
    // helper to return all to the webpage.
    questions: function() {
      // Use find() to get all the documents from the
      // local questionDB collection, and use fetch()
      // to convert the entire collection into an array.
      let qs = questionDB.find().fetch();
      // Use shuffule() of the underscore page to randomly
      // order the questions in the qs array.
      let qs_ord = _.shuffle(qs);
      // Return the questions in a random order.
      return qs_ord;
    }
  }
);

// The event listeners for the 'learning' template
Template.learning.events(
  {
    // Take actions when a radio button is clicked.
    'click input[type="radio"]': function(event, instances) {
      // Get the ID of the question from the 'name' attribute
      // of the current target being clicked.
      let questionId = event.currentTarget.name;
      // Get rid of 'id_' so we can get the real question ID
      // See comments in /client/main.html to see why 'id_'
      // is added in the first place.
      questionId = questionId.replace('id_', '');
      // Get the text of the clicked option from the 'value'
      // attribute of the current target being clicked.
      let optionText = event.currentTarget.value;
      // Organize the question ID and the option text into
      // an object of a temporary answer for a question.
      let answerObj = {
        id: questionId,
        answer: optionText
      }
      // If the array created as a template variable for storing 
      // temporary answers is still empty...
      if(instances.answers.length === 0) {
        // Push the temporary answer object into the array.
        instances.answers.push(answerObj);
      }
      // If the array already has something inside
      else {
        // Loop through the entire array...
        for(let index=0 ; index < instances.answers.length ; index++) {
          // In every single loop, take out each temporary answer one by one...
          let currentAns = instances.answers[index];
          // Check if the ID of the temporary answer taken from the array
          // is identical to the ID of the temporary answer object that was just
          // created.
          if(currentAns.id === answerObj.id) {
            // If so, just update the answer of the current temporary answer
            // in the array.
            instances.answers[index].answer = answerObj.answer;
            // If a temporary answer with a matching question ID was found and updated,
            // break the loop since we don't need to check the rest of the array.
            break;
          }
          // In every loop, if the question ID has no match in the array of temporary
          // answers, and we're reaching the end of the array...
          else if(index === instances.answers.length - 1) {
            // This temporary answer is new, so push it into the array.
            instances.answers.push(answerObj);
          }
        }
      }
    },
    // An event listener for the <input id="submitAns"> element for submitting
    // all the temporary answers.
    'click input#submitAns': function(event, instances) {
      let allAns = instances.answers;
      // Submit the answers to the server for validation for the current user
      Meteor.call('validateAns', allAns, Session.get('username'));
      // Reset the current answer array after each submission
      instances.answers = [];
    }
  }
);