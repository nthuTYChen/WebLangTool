import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

global.questionDB = new Mongo.Collection('questionDB');

Meteor.startup(
  async function() {
    await questionDB.removeAsync({});
    let questions = await Assets.getTextAsync('multipleChoiceSample.txt');
    let questionList = questions.split('--');
    for(let index = 0 ; index < questionList.length ; index++) {
      let question = questionList[index].trim();
      let questionParts = question.split('\n');
      let questionObj = {
        question: questionParts[0],
        option1: questionParts[1],
        option2: questionParts[2],
        option3: questionParts[3],
        option4: questionParts[4],
        answer: questionParts[5]
      };
      questionDB.insertAsync(questionObj);
    }
  }
);
