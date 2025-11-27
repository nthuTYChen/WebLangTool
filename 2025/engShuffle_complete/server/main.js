import { Mongo } from 'meteor/mongo';

global.sentenceDB = new Mongo.Collection('sentenceDB');
global.userProfileDB = new Mongo.Collection('userProfileDB');

Meteor.publish('sentencesByLevel', function(level) {
	return sentenceDB.find({level: level}, {fields: {sentence: 0, words: 0}});
});

Meteor.publish('userProfile', function(username) {
	return userProfileDB.find({username: username}, {fields: {RTs: 0}});
});

Meteor.startup(async function() {
	await sentenceDB.removeAsync({});
	let fulltext = await Assets.getTextAsync('sentenceList.txt');
	let sentences = fulltext.split('\r\n');
	sentences.forEach(function(sentence) {
		let sentenceInfo = sentence.trim().split('/');
		let words = sentenceInfo[1].split(' ');
		let shuffledWords = _.shuffle(words);
		sentenceDB.insertAsync({level: sentenceInfo[0], sentence: sentenceInfo[1], words: words, shuffledWords: shuffledWords});
	});
});

Meteor.methods(
	{
		registerUser: function() {
			userProfileDB.upsertAsync({username: 'TYC'}, {$setOnInsert: {level: 'beginner', score: 0, meanRT: 0, RTs: []}});
		},
		recordAns: async function(record) {
			let targetSentence = await sentenceDB.findOneAsync({_id: record.sentenceID});
			let targetLength = targetSentence.words.length;
			let resArray = new Array(targetSentence.words.length);
			let newScore = 0;
			for(let index = 0; index < targetLength; index++) {
				if(record.answer[index] === targetSentence.words[index]) {
					newScore++;
					resArray[index] = true;
				}
			}
			let userProfile = await userProfileDB.findOneAsync({username: record.username});
			let userRTs = userProfile.RTs;
			userRTs.push(record.RT);
			let RTsum = 0;
			userRTs.forEach(function(RT) {
				RTsum += RT;
			});
			let newUserScore = userProfile.score + newScore;
			let upgrade = newUserScore > 50;
			let newLevel = upgrade ? 'intermediate' : 'beginner';
			let newMeanRT = Math.round(RTsum / userRTs.length / 100) / 10;
			await userProfileDB.updateAsync({username: record.username}, 
				{$set: {score: newUserScore, meanRT: newMeanRT, RTs: userRTs, level: newLevel}});
			return resArray;
		}
	}
);