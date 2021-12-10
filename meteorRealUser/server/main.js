import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
  process.env.MAIL_URL = 
    'smtp://shaferain@live.com:xxxx@smtp-relay.sendinblue.com:587';
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