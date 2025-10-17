/* Oct 3, 2025 - To begin with, please make sure that you've installed the
   following packages to this new Meteor demo application: session, reactive-var, random.
   Then, please remember to create a private directory with "multipleChoiceSample.txt"
   file inside.
*/

import { Meteor } from 'meteor/meteor';
// Import the mongoDB package
import { Mongo } from 'meteor/mongo';

// Create a new "questionDB" collection to store every multiple-choice vocabulary
// question as an individual document.
global.questionDB = new Mongo.Collection('questionDB');

Meteor.publish('allQuestions', function() {
  return questionDB.find({}, {fields: {answer: 0}});
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
        question: questionParts[0], // The first line is the question itself
        option1: questionParts[1],  // The second-fifth lines are the four options
        option2: questionParts[2],
        option3: questionParts[3],
        option4: questionParts[4],
        answer: questionParts[5]    // The sixth line is the correct answer.
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
