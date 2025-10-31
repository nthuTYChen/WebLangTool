/* Oct 17, 2025 - To begin with, please make sure that you've installed the
   following packages to this new Meteor demo application: session, reactive-var, underscore.
   Then, please remember to create a private directory with "multipleChoiceSample.txt"
   file inside.
*/

import { Meteor } from 'meteor/meteor';
// Import the mongoDB package
import { Mongo } from 'meteor/mongo';

// Create a new "questionDB" collection to store every multiple-choice vocabulary
// question as an individual document.
global.questionDB = new Mongo.Collection('questionDB');
// Create a new "userDataDB" collection to store every user profile.
global.userDataDB = new Mongo.Collection('userDataDB');
// Create a new "userDataDB" collection to store the record of every answer submission.
global.submitRecordDB = new Mongo.Collection('submitRecordDB');

// Publish the questionDB collection in the name of 'allQuestions'
Meteor.publish('allQuestions', function() {
  /* The first empty object {} in find() represents the selector, and an empty object
     matches every single document. The second object sets the options of this
     document search, and 'fields' determins the fields to be included (1) or excluded (0)
     in the documents published to the client.*/
  return questionDB.find({}, {fields: {answer: 0}});
});

// Publish user data based on the username sent from the client side in the name of
// userData.
Meteor.publish('userData', function(username) {
   // Since each username will only have one profile in the collection (see below),
   // userDataDB.find() returns only one document if there's a match.
   return userDataDB.find({username: username});
});

Meteor.startup(
  // The function that runs when the Meteor server starts running.
  /* The function is "async" (asynchronous) because an asynchronous
     action is taken below, labeled with the keyword "await".
  */
  async function() {
    /* The first step is to clear everything ({}) in questionDB using removeAsync(), 
       so no duplicated questions are inserted. Everything that follows must "wait"
       until this asynchronous action is done.
    */
    await questionDB.removeAsync({});
    /* Use Assets.getTextAsync() to load the text file from the /private folder, which
       includes the entire question list, in which each question is separated by '--'.
       We need to make sure that the text is loaded properly to "questions", so everything
       else below also "waits" until the loading action is done.
    */
    let questions = await Assets.getTextAsync('multipleChoiceSample.txt');
    // Split the entire text string with the string '--' into an array with three data
    // entries assigned to "questionList".
    let questionList = questions.split('--');
    /* Every for loop takes out a long string stored in "questionList" based on the index
       number, so each question could be broken into individual lines to be formatted into
       a question object.
    */
    for(let index = 0 ; index < questionList.length ; index++) {
      /* Take out the question string from "questionList" one by one,
         and use trim() to remove redundant characters (e.g., line breaking 
         or space) at the beginning and the end from the long question string.
      */
      let question = questionList[index].trim();
      /* Split each long question string into individual lines using the line
         breaker character (i.e., \n). The output is an array of six strings
         stored in "questionParts"
      */
      let questionParts = question.split('\n');
      /* Create an object based on each "line" in questionParts */
      let questionObj = {
        // Add trim() to the end of each data entry to remove redundant characters from
        // the beginning and the end of each string (e.g., other invisible characters like 
        // \r or extra spacing)
        question: questionParts[0].trim(), // The first line is the question itself
        option1: questionParts[1].trim(),  // The second-fifth lines are the four options
        option2: questionParts[2].trim(),
        option3: questionParts[3].trim(),
        option4: questionParts[4].trim(),
        answer: questionParts[5].trim()    // The sixth line is the correct answer.
      };
      /* Insert the question object as a document into "questionDB". While insertAsync()
         is also asynchronous, we don't have to wait here. We can just leave the insertion
         process here and move on to the next loop, because nothing depends on the 
         completion of this insertion action.
      */
      questionDB.insertAsync(questionObj);
    }
  }
);

// All server Meteor method
Meteor.methods(
   {
      /* The corresponding function is "async" since there's
         one statement with an asychronous act specified by "await"
         Get the username from the client and add a user profile
         accordingly.*/
      addUser: async function(username) {
         // Check if a user profile can be found in userDataDB.
         // If there is, the output document will be stored to "existingUser".
         // If not, the output will be "undefined."
         let existingUser = await userDataDB.findOneAsync({username: username});
         // If the output is "undefined" (i.e., no match), "!existingUser" equals
         // to TRUE, and this method will add a new user profile.
         if(!existingUser) {
            let newUserProfile = {
               username: username, // Store the username passed from the client
               score: 0, // Total vocabulary learning score starts at 0 by default
               joinedAt: new Date() // new Date() gets the present time when the profile is created.
            };
            // Insert the new user profile to the collection
            userDataDB.insertAsync(newUserProfile);
         }
      },
      // Check answers and calculate scores for the user
      validateAns: async function(answers, username) {
         //console.log(answers);
         // The score count begin with 0
         let totalScore = 0;
         // Iterate through the array of answers to validate each answer
         for(let index=0 ; index<answers.length ; index++) {
            // Get one answer object at a time.
            let ans = answers[index];
            // Search for a document from questionDB based on question ID
            // and the answer. If the answer for the question is right,
            // a match will be found. Otherwise, the output would be "undefined".
            let corrAnsDoc = 
               await questionDB.findOneAsync({_id: ans.id, answer: ans.answer});
            // If there's match (i.e., a correct answer for the question)...
            if(corrAnsDoc) {
               // Increase the totalScore by 1
               totalScore++;
            }
         }
         // After all the answers were checked, update the user profile based on
         // the username with the number of correct answers.

         // We use $inc rather than $set because we want to increase a value
         // of a field with a specific number. Here, we increase the "score" field
         // by "totalScore" (e.g., 0, 1, 2...).

         // We don't need to add "await" here for this asynchronous act, since nothing
         // is dependent on the result of this update.
         userDataDB.updateAsync({username: username}, {$inc: {score: totalScore}});
         // Insert each submission record to the submitRecordDB
         // Organize the record object
         let submitRecord = {
            username: username, // store the username, so each record has its "owner"
            submittedAt: new Date(), // add the time of submission
            answers: answers // store the entire answer array for each submission
         };
         // We don't need to add "await" here for this asynchronous act, since nothing
         // is dependent on the result of this update.
         submitRecordDB.insertAsync(submitRecord);
      }
   }
);