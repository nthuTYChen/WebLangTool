import { Mongo } from 'meteor/mongo';

global.sentenceDB = new Mongo.Collection('sentenceDB');
global.userProfileDB = new Mongo.Collection('userProfileDB');

Meteor.startup(async function() {
	await sentenceDB.removeAsync({});
	let fulltext = await Assets.getTextAsync('sentenceList.txt');
	let sentences = fulltext.split('\r\n');
	sentences.forEach(
		function(sentence) {
			let sentenceInfo = sentence.trim().split('/');
			let words = sentenceInfo[1].split(' ');
			let shuffledWords = _.shuffle(words);
			sentenceDB.insertAsync({level: sentenceInfo[0], words: words, shuffledWords: shuffledWords});
		}
	);
});