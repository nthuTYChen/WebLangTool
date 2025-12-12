import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Session.setDefault('browseSession', 'frontPage');
Session.setDefault('username', '');

global.userProfileDB = new Mongo.Collection('userProfileDB');
global.sentenceDB = new Mongo.Collection('sentenceDB');

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
      // Place individual characters in an array (non-reactive) and return
      // the array to the front page, so we won't have to manually include
      // HTML elements in the HTML file, which save us some work.
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
      shuffledWords: function() {
         let currentList = Template.instance().shuffledWords.get();
         return currentList;
      },
      orderedWords: function() {
         let currentList = Template.instance().orderedWords.get();
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
         let shuffledList = _.shuffle(allSentences[0].shuffledWords);
         instances.shuffledWords.set(shuffledList);
         instances.sentenceLength.set(shuffledList.length);
         instances.sentenceID.set(allSentences[0]._id);
         instances.startTime = new Date();
         event.currentTarget.style.display = 'none';
      },
      'click section#shuffleZone > button': function(event, instances) {
         let removedWord = event.currentTarget.innerText;
         let currentShuffledList = instances.shuffledWords.get();
         let newShuffledList = _.without(currentShuffledList, removedWord);
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
            };
            console.log(ansRecord);
            Meteor.callAsync('recordAns', ansRecord).then(function(correctness) {

            });
         }
      },
      'click section#answerZone > button': function(event, instances) {
         if(!instances.done) {
            let removedWord = event.currentTarget.innerText;
            let currentOrderedList = instances.orderedWords.get();
            let newOrderedList = _.without(currentOrderedList, removedWord);
            instances.orderedWords.set(newOrderedList);
            let newShuffledList = instances.shuffledWords.get();
            newShuffledList.push(removedWord);
            instances.shuffledWords.set(newShuffledList);
         }
      },
      'click #end': function() {
         Session.set('browseSession', 'frontPage');
         Session.set('username', '');
      }
   }
);