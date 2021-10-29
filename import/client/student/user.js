import './user.html';

Template.user.helpers({
	userSession: function() {
		return Session.get('userSession');
	}
});

Template.userIndex.onCreated(function() {
	this.username = 'TYC';
	Meteor.subscribe('userProfile', this.username);
	this.userProfile = {
		name: '',
		type: 'student',
		gender: 'transgender',
		age: 0
	};
});

Template.userIndex.helpers({
	profileKey: function(key) {
		let profile = userData.findOne();
		return profile && profile[key];
	}
});

Template.userIndex.events({
	'click input[type="radio"]': function(event) {
		Template.instance().userProfile.gender = event.target.value;
	},
	'submit form': function(event) {
		event.preventDefault();
		let newProfile = Template.instance().userProfile;
		newProfile.name = document.getElementById('name').value;
		Template.instance().username = newProfile.name;
		console.log(Template.instance().username);
		newProfile.age = Number(document.getElementById('age').value);
		Meteor.call('serverWindow', {funcName: 'addUpdateProfile', info: newProfile});
	},
	'click button#vocab': function() {
		Session.set('userSession', 'vocab');
	},
	'click button#writing': function() {
		Session.set('userSession', 'writing');
	},
	'click button#testFuncCall': function() {
		Meteor.call('serverWindow', {funcName: 'testFuncCall'});
	},
	'click button#printProfile': function() {
		let profile = {
			name: 'TYC',
			age: 40,
			dob: '1981-xx-xx',
			gender: 'male',
			handedness: 'right'
		};
		// Synchrounous coding
		// let result = Meteor.call('printProfile', profile);
		// console.log(result);
		// Asynchrounous coding
		Meteor.call('serverWindow', {funcName: 'printProfile', info: profile}, 
			function(err, res) {
				// Callback function
				if(err) {
					console.log(err.reason);
				}
				else {
					console.log(res);
				}
		});
		console.log('The end of the function.');
	}
});

Template.vocab.onCreated(function() {
	this.ansSession = {
		name: '',
		tussock: 0,
		ambit: 0,
		apposite: 0
	};
});

Template.vocab.events({
	'click button': backToHome,
	'click input[type="radio"]': function(event) {
		//console.log(event);
		let className = event.target.className;
		let answer = Number(event.target.value);
		Template.instance().ansSession[className] = answer;
		/*console.log(className);
		console.log(answer);
		console.log(Template.instance().ansSession);*/
	},
	'submit form': function(event) {
		event.preventDefault();
		let name = document.getElementById('name').value;
		let answers = Template.instance().ansSession;
		answers.name = name;
		Meteor.call('serverWindow', {funcName: 'checkAns', info: answers});
	}
});

Template.writing.events({
	'click button': backToHome
});

function backToHome() {
	Session.set('userSession', 'userIndex');
}