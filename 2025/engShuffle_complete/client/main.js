import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';

import './main.html';

Session.setDefault('browseSession', 'frontPage');
Session.setDefault('username', '');

global.sentenceDB = new Mongo.Collection('sentenceDB');
global.userProfileDB = new Mongo.Collection('userProfileDB');

Template.body.onCreated(function() {
   Tracker.autorun(function() {
      Meteor.subscribe('userProfile', Session.get('username'));
   });
});

Template.body.helpers(
   {
      browseSession: function() {
         return Session.get('browseSession');
      }
   }
);

Template.frontPage.helpers(
   {
      frontPageHeader1: function() {
         let header = ['E', 'n', 'g', 'l', 'i', 's', 'h'];
         return header;
      },
      frontPageHeader2: function() {
         let header = ['S', 'h', 'u', 'f', 'f', 'l', 'e', '!'];
         return header;
      }
   }
);

Template.frontPage.events(
   {
      'click button': function() {
         Session.set('browseSession', 'shuffleTest');
         Session.set('username', 'TYC');
         Meteor.call('registerUser');
      }
   }
);

Template.shuffleTest.onCreated(function() {
   this.shuffledWords = new ReactiveVar([]);
   this.orderedWords = new ReactiveVar([]);
   this.sentenceLength = new ReactiveVar(10000);
   this.sentenceID = new ReactiveVar('');
   this.startTime = null;
   this.done = false;
   Tracker.autorun(function() {
      let userProfile = userProfileDB.findOne();
      Meteor.subscribe('sentencesByLevel', userProfile && userProfile.level);
   });
});

Template.shuffleTest.helpers(
   {
      isComplete: function() {
         let currentList = Template.instance().orderedWords.get();
         let senLength = Template.instance().sentenceLength.get();
         if(currentList.length === senLength) {
            return true;
         }
         return false;
      },
      orderedWords: function() {
         let currentList = Template.instance().orderedWords.get();
         return currentList;
      },
      shuffledWords: function() {
         let currentList = Template.instance().shuffledWords.get();
         return currentList;
      },
      userProfile: function(key) {
         let userProfileObj = userProfileDB.findOne();
         return userProfileObj && userProfileObj[key];
      }
   }
);

Template.shuffleTest.events(
   {
      'click #start': function(event, instances) {
         let allSentences = _.shuffle(sentenceDB.find({}).fetch());
         if(allSentences.length !== 0) {
            let shuffledList = _.shuffle(allSentences[0].shuffledWords);
            instances.shuffledWords.set(shuffledList);
            instances.sentenceLength.set(shuffledList.length);
            instances.sentenceID.set(allSentences[0]._id);
            instances.startTime = new Date();
            event.currentTarget.style.display = 'none';
         }
      },
      'click section#shuffleZone > button': function(event, instances) {
         let removedWord = event.currentTarget.innerText;
         let currentShuffledList = instances.shuffledWords.get();
         newShuffledList = _.without(currentShuffledList, removedWord);
         instances.shuffledWords.set(newShuffledList);
         let newOrderedList = instances.orderedWords.get();
         newOrderedList.push(removedWord);
         instances.orderedWords.set(newOrderedList);
         if(newShuffledList.length === 0) {
            instances.done = true;
            let currentTime = new Date();
            let totalTime = currentTime.getTime() - instances.startTime.getTime();
            let ansRecord = {
               sentenceID: instances.sentenceID.get(),
               username: Session.get('username'),
               RT: totalTime,
               answer: newOrderedList
            }
            Meteor.callAsync('recordAns', ansRecord).then(function(correctness) {
               let orderedWords = document.querySelectorAll('section#answerZone > button');
               for(let index = 0; index < correctness.length; index++) {
                  let word = orderedWords[index];
                  if(correctness[index]) {
                     word.classList.add('correct');
                  }
                  else {
                     word.classList.add('incorrect');
                  }
               }
            });
         }
      },
      'click section#answerZone > button': function(event, instances) {
         if(!instances.done) {
            let removedWord = event.currentTarget.innerText;
            let currentOrderedList = instances.orderedWords.get();
            newOrderedList = _.without(currentOrderedList, removedWord);
            instances.orderedWords.set(newOrderedList);
            let newShuffledList = instances.shuffledWords.get();
            newShuffledList.push(removedWord);
            instances.shuffledWords.set(newShuffledList);
         }
      },
      'click #next': function(event, instances) {
         instances.done = false;
         instances.orderedWords.set([]);
         let allSentences = _.shuffle(sentenceDB.find({}).fetch());
         let shuffledList = _.shuffle(allSentences[0].shuffledWords);
         instances.shuffledWords.set(shuffledList);
         instances.sentenceLength.set(shuffledList.length);
         instances.sentenceID.set(allSentences[0]._id);
         instances.startTime = new Date();
      },
      'click #end': function() {
         Session.set('browseSession', 'frontPage');
      }
   }
);