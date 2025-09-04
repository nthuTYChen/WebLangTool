import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

import '/import/server/databases.js';
import serverFunc from '/import/server/serverFunc.js';

Meteor.startup(function() {
  let username = '';
  let password = '';
  let server = 'smtp-relay.sendinblue.com';
  let port = 587;
  process.env.MAIL_URL = 
    'smtp://' + username + ':' + password + '@' + server + ':' + port;
});

Accounts.config({
  sendVerificationEmail: true
});

Accounts.emailTemplates.siteName = 'English Powerhouse';

Accounts.emailTemplates.from = 'English Powerhouse <englishpowerhouse@no-reply.englishpowerhouse.com>';

Accounts.emailTemplates.verifyEmail.subject = function(user) {
  return 'English Powerhouse Verification';
};

Accounts.emailTemplates.verifyEmail.text = function(user, url) {
  let emailText = 'Click the link below to verify your English Powerhouse account:\n\n' + url;
  return emailText;
};

Accounts.onCreateUser(function(regInfo, user) {
  let customProfile = regInfo.profile;

  if(customProfile.type === 'lecturer') {
    customProfile.students = [];
  }
  else {
    customProfile.lecturer = null;
    customProfile.vocabScore = 0;
  }

  user.profile = customProfile;
  return user;
});

Accounts.validateLoginAttempt(function(attempt) {
  let callingMethod = attempt.methodName;
  if(callingMethod === 'createUser' || callingMethod === 'verifyEmail') {
    return false;
  }
  return true;
});

Meteor.methods({
  serverWindow: function(clientInfo) { // clientInfo.info & clientInfo.funcName
    let userData = Meteor.user(); // Get user info on the server side
    // Do the rest if the user info is found
    if(userData) {
      clientInfo.info.user = {};
      clientInfo.info.user.userId = userData._id;
      clientInfo.info.user.realName = userData.profile.realName;
      clientInfo.info.user.email = userData.username;
      clientInfo.info.user.type = userData.profile.type;
      serverFunc[clientInfo.funcName](clientInfo.info);
    }
  }
});