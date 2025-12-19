// Import the essential packages
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

// Import the main HTML document of the application.
import './main.html';

// Set the default values of the session variables for
// (1) load templates dynamically, and (2) record the username.
Session.setDefault('browseSession', 'frontPage');
Session.setDefault('username', '');

// Create the local copy of the server collections as global variables.
global.userProfileDB = new Mongo.Collection('userProfileDB');
global.sentenceDB = new Mongo.Collection('sentenceDB');

// When <body> is loaded, subscribe to the userProfile publication with the
// user name, so all templates within <body> can have access to user info.
Template.body.onCreated(function() {
   Tracker.autorun(function() {
      Meteor.subscribe('userProfile', Session.get('username'));
   });
});

// Just a helper that returns the browseSession variable reactively for
// dynamic template loading.
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

// The only event listener for the "Let's go!" button on the front page
Template.frontPage.events(
   {
      // When the button is clicked...
      'click button': function() {
         // Load the shuffleTest template
         Session.set('browseSession', 'shuffleTest');
         // Set the user name and register the user on the server side. 
         // Again, this is not necessary if you use the account-passwords package.
         // I assume that it is the same user in this demo, so the user name
         // is always set to be TYC, and it is always TYC that is registered on the
         // server side.
         Session.set('username', 'TYC');
         Meteor.call('registerUser');
      }
   }
);

// Do many things when the shuffleTest template is loaded.
Template.shuffleTest.onCreated(function() {
   // Create a reactive array for storing the shuffled words
   this.shuffledWords = new ReactiveVar([]);
   // Create a reactive array for storing the ordered words selected from the shuffled words.
   this.orderedWords = new ReactiveVar([]);
   // Create a reactive variable representing the length of a target sentence.
   // Default value set to 10000, see the "isComplete" helper below for why.
   this.sentenceLength = new ReactiveVar(10000);
   // We need a reactive variable for storing the ID of the current sentence, which will be
   // submitted to the server for validating the answer.
   this.sentenceID = new ReactiveVar('');
   // A non-reactive variable for storing the start time of the current test.
   this.startTime = null;
   // A non-reactive variable for storing the test status (i.e., whether it is done or not)
   this.done = false;
   // Subscribe to the sentences of a specific level based on the user's level in the profile.
   Tracker.autorun(function() {
      let userProfile = userProfileDB.findOne();
      Meteor.subscribe('sentencesByLevel', userProfile && userProfile.level);
   });
});

// The helpers that contribute to the control of the Web interface.
Template.shuffleTest.helpers(
   {
      // Check if the current test is complete.
      isComplete: function() {
         // Get the current array of ordered words.
         let currentList = Template.instance().orderedWords.get();
         // Get the target sentence length
         let senLength = Template.instance().sentenceLength.get();
         // Check if the array length of the ordered words is the same
         // as the target sentence length. Because initially orderedWords
         // is an empty array, it has a length of zero. To avoid returning
         // true right at the very beginning of the test, the target sentence
         // was initially set to be 10000 above.
         if(currentList.length === senLength) {
            return true;
         }
         return false;
      },
      shuffledWords: function() {
         // Get the array of the shuffled words and return it to the shuffleTest template
         let currentList = Template.instance().shuffledWords.get();
         return currentList;
      },
      orderedWords: function() {
         // Get the array of the ordered words and return it to the shuffleTest template
         let currentList = Template.instance().orderedWords.get();
         return currentList;
      },
      userProfile: function(key) {
         // Return user info based on the key received from the shuffleTest template.
         let userProfileObj = userProfileDB.findOne();
         return userProfileObj && userProfileObj[key];
      }
   }
);

// The event listeners associated to the three buttons in the shuffleTest template.
Template.shuffleTest.events(
   {
      // Click to start a test
      'click #start': function(event, instances) {
         // Shuffle the sentences published from the server, so the order of test
         // sentences will never be the same when the test begin.
         let allSentences = _.shuffle(sentenceDB.find({}).fetch());
         // Get the first sentence following the above step, shuffled the randomly ordered
         // words again, so the shuffled word order will never be the same for each sentence.
         let shuffledList = _.shuffle(allSentences[0].shuffledWords);
         // Set the doubly shuffled word array to shuffledList.
         instances.shuffledWords.set(shuffledList);
         // Set the target sentence length as the length of the doubly shuffled array.
         instances.sentenceLength.set(shuffledList.length);
         // Set the sentence ID as the current test sentence ID.
         instances.sentenceID.set(allSentences[0]._id);
         // Record the time when the test begin.
         instances.startTime = new Date();
         // Hide the current target - the start button does not have to be there once the
         // test has already started.
         event.currentTarget.style.display = 'none';
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
      // When users click on any button in the shuffle zone...That is, to select any
      // shuffled word...
      'click section#shuffleZone > button': function(event, instances) {
         /* Here's the explanation for the following steps: (1) Get the word from the inner text
            of the button element, which is to be removed from the shuffled word list, (2) get
            the current shuffled word list and remove the word, which creates a new shuffled word
            list, (3) set the reactive variable for the shuffled word list, (4) add the word to the
            ordered word list, and (5) update the ordered word list reactive variable.
         */
         let removedWord = event.currentTarget.innerText;
         let currentShuffledList = instances.shuffledWords.get();
         let newShuffledList = _.without(currentShuffledList, removedWord);
         instances.shuffledWords.set(newShuffledList);
         let newOrderedList = instances.orderedWords.get();
         newOrderedList.push(removedWord);
         instances.orderedWords.set(newOrderedList);
         // Check if the new shuffled word list still have any word, any if not...
         if(newShuffledList.length === 0) {
            // Mark the current test as 'done'
            instances.done = true;
            // Get the current time
            let currentTime = new Date();
            // Calculate the time (in milliseconds) spent on this test
            let totalTime = currentTime.getTime() - instances.startTime.getTime();
            // Organize a test answer record
            let ansRecord = {
               // Sentence ID for answer validation
               sentenceID: instances.sentenceID.get(),
               // User name for profile update
               username: Session.get('username'),
               // The time spent on the test
               RT: totalTime,
               // The ordered word list as the answer.
               answer: newOrderedList
            };
            // Call the server method recordAns and pass over ansRecord. Wait for the server's
            // response, "then" process the correctness of the answer from the server.
            Meteor.callAsync('recordAns', ansRecord).then(function(correctness) {
               let orderedWords = document.querySelectorAll('section#answerZone > button');
               for(let index = 0; index < correctness.length ; index++) {
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
      // When users click on any button in the answer zone...That is, to select any
      // word that has been ordered...
      'click section#answerZone > button': function(event, instances) {
         // Allow changes only if the current test is NOT done.
         if(!instances.done) {
            // Move the ordered word back to the shuffled word list. The logics
            // is the same as above. It is just that the direction of movement
            // is opposite.
            let removedWord = event.currentTarget.innerText;
            let currentOrderedList = instances.orderedWords.get();
            let newOrderedList = _.without(currentOrderedList, removedWord);
            instances.orderedWords.set(newOrderedList);
            let newShuffledList = instances.shuffledWords.get();
            newShuffledList.push(removedWord);
            instances.shuffledWords.set(newShuffledList);
         }
      },
      // When users click on the "End" button...
      'click #end': function() {
         // Navigate back to the front page
         Session.set('browseSession', 'frontPage');
         // Clear the user name, because it is unnecessary to subscribe to the
         // user profile on the front page.
         Session.set('username', '');
      }
   }
);