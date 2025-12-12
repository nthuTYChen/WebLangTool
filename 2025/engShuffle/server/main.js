import { Mongo } from 'meteor/mongo';

// Create the collections for sentences with a shuffled word order
// and for user profile that tracks user's progress
global.sentenceDB = new Mongo.Collection('sentenceDB');
global.userProfileDB = new Mongo.Collection('userProfileDB');

Meteor.publish('sentencesByLevel', function(level) {
	return sentenceDB.find({level: level}, {fields: {sentence: 0, words: 0}});
});

Meteor.publish('userProfile', function(username) {
	return userProfileDB.find({username: username}, {fields: {RTs: 0}});
});

// Process the sentences in the sentence liston the server side when the app
// starts
Meteor.startup(async function() {
	// Remove all sentence documents first before processing the entire list
	// so any updates on the list can apply. Wait the asynchronous process to
	// complete.
	await sentenceDB.removeAsync({});
	// Load the sentence list from the /private folder
	let fulltext = await Assets.getTextAsync('sentenceList.txt');
	// Split the entire texts into individual lines using the '\r\n' string
	// stored in an array.
	let sentences = fulltext.split('\r\n');
	// Process each sentence line and insert a sentence info document
	sentences.forEach(
		function(sentence) {
			// Split each line with a back slash '/', which separate the sentence
			// itself and the level of the sentence after trimming potential redudant spacing
			// or characters at the beginning and the end of each line.
			let sentenceInfo = sentence.trim().split('/');
			// For each sentence itself (i.e., the second entry of the sentenceInfo array), 
			// split the string into individual words with a space
			let words = sentenceInfo[1].split(' ');
			// Shuffle the order of individual words.
			let shuffledWords = _.shuffle(words);
			// Insert the sentence document with (1) the entire sentence itself, (2) the sentence
			// splitted into individual words in the original order, and (3) the sentence splitted into
			// individual words in a random order
			sentenceDB.insertAsync({level: sentenceInfo[0], words: words, shuffledWords: shuffledWords});
		}
	);
});

Meteor.methods(
	{
		registerUser: function() {
			userProfileDB.upsertAsync({username: 'TYC'}, 
				{$setOnInsert: {level: 'beginner', score: 0, meanRT: 0, RTs: []}});
		},
		recordAns: async function(record) {
			let targetSentence = await sentenceDB.findOneAsync({_id: record.sentenceID});
			let targetLength = targetSentence.words.length;
			let resArray = new Array(targetLength);
			let newScore = 0;
			for(let index = 0 ; index < targetLength ; index++) {
				if(record.answer[index] === targetSentence.words[index]) {
					newScore++;
					resArray[index] = true;
				}
			}
			console.log(newScore);
			console.log(resArray);
		}
	}
);