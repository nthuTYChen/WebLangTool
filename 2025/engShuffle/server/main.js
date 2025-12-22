import { Mongo } from 'meteor/mongo';

// Create the collections for sentences with a shuffled word order
// and for user profile that tracks user's progress
global.sentenceDB = new Mongo.Collection('sentenceDB');
global.userProfileDB = new Mongo.Collection('userProfileDB');

// Publish the test sentences according to the level of the user. Again, if you
// have a real user-password system, the user level can be directly checked
// on the server.
Meteor.publish('sentencesByLevel', function(level) {
	// There's no need to publish the entire "sentence" and the individual "words"
	// in correct order, so there's no way a user can cheat with this information.
	return sentenceDB.find({level: level}, {fields: {sentence: 0, words: 0}});
});

// Publish the user profile according to the username. Again, if you
// have a real user-password system, the user profile can be published
// directly by checking the user that is currently logged in.
Meteor.publish('userProfile', function(username) {
	// Do not publish with the array keeping the time lengths of each
	// test, since they have no use on the client side. Again, only
	// publish things that are necessary to minimize data transmission.
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
		// Add the user profile to the server collection. Again, if you have the real user-password system,
		// you probably don't need this.
		registerUser: function() {
			// The user is always TYC to keep things simpler. The most important part here with the
			// upsertAsync action is the keys and values that are added only when the profile is
			// inserted into the collection. "level" is the current user level, "score" is the total score,
			// "meanRT" is the average time spent on each test, "RTs" is an array that keeps each time
			// length spent a test.
			userProfileDB.upsertAsync({username: 'TYC'}, 
				{$setOnInsert: {level: 'beginner', score: 0, meanRT: 0, RTs: []}});
		},
		// Validate the answer record submitted from the user. A lot of steps have to "wait"
		// for the results of their action, so this function is asynchronous.
		recordAns: async function(record) {
			// Get the target sentence based on the sentence ID embedded in the answer record.
			// store the matched document to targetSentence.
			let targetSentence = await sentenceDB.findOneAsync({_id: record.sentenceID});
			// Check the target sentence length again based on the number of words in the word
			// array in the matched document.
			let targetLength = targetSentence.words.length;
			// Create an array of correctness with n "null" values, where n is the length of target sentence.
			let resArray = new Array(targetLength);
			// Set up the score counter.
			let newScore = 0;
			// Loop through each word in the answer word array and compare the word to each
			// word in the correct word.
			for(let index = 0 ; index < targetLength ; index++) {
				// If the word in the answer is identical to the word in the correct order...
				if(record.answer[index] === targetSentence.words[index]) {
					// Increase the score counter by 1: 1 point per word in the correct position.
					newScore++;
					// Change the value in the same position in the array of correctness to "true",
					// which means the answer word in this position is correct.
					resArray[index] = true;
				}
			}
			// Get the current user profile
			let userProfile = await userProfileDB.findOneAsync({username: record.username});
			// Get all the test time lengths for previous test from the profile
			let userRTs = userProfile.RTs;
			// Add the current test time length to the user's time length record array
			userRTs.push(record.RT);
			// Calculate the average test time length in seconds.
			// A variable for storing the sum of test time lengths
			let RTsum = 0;
			// Loop through the array of all the test time lengths
			userRTs.forEach(function(RT) {
				// Add each time length to RTsum: RTsum += RT is equivalent to RTsum = RTsum + RT
				RTsum += RT;
			});
			// Calculate the average test time length in seconds rounded to the first decimal place.
			// Here is an example with RTsum = 5510 and userRTs.length = 5.
			// 1: 5510 / 5 = 1102 (the average test time length in milliseconds)
			// 2: 1102 / 100 = 11.02
			// 3: Math.round(11.02) = 11 (Math.round() always rounds a number to an integer)
			// 4: 11 / 10 = 1.1 (seconds rounded up to the first decimal place)
			let newMeanRT = Math.round(RTsum / userRTs.length / 100) / 10;
			// Add the score of the current test to the previous total score of the user
			let newUserScore = userProfile.score + newScore;
			// Check if the new total score is higher than 50.
			let upgrade = newUserScore > 50;
			// A short form of if...else... statement:
			// If upgrade is TRUE, newLevel is "intermediate", or newLevel is "beginner"
			let newLevel = upgrade ? 'intermediate' : 'beginner';
			// Update the user profile
			await userProfileDB.updateAsync({username: record.username}, 
				{$set: {score: newUserScore, meanRT: newMeanRT, RTs: userRTs, level: newLevel}});
			// Return the result array recording the correctness of each word to the client.
			return resArray;
		}
	}
);