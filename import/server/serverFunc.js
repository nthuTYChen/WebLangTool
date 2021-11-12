export const testFuncCall = function () {
	console.log('A server function is called!');
};

export const printProfile = function (profile) {
    if(!profile.age) {
      throw new Meteor.Error(500, 'There is no age information!');
    }
    let msg = 'The username is %n, who is %a-years-old.';
    msg = msg.replace('%n', profile.name);
    msg = msg.replace('%a', profile.age);
    return msg;
};

export const addUpdateProfile = function (profile) {
  if(profile.type === 'student') {
    userData.update(
      {name: profile.name, type: profile.type},
      {$set: {gender: profile.gender, age: profile.age}, 
        $setOnInsert: {score: 0, createdAt: new Date()}},
      {upsert: true}
    );
  }
  else {
    userData.update(
      {name: profile.name, type: profile.type},
      {$setOnInsert: {students: [], createdAt: new Date()}},
      {upsert: true}
    );
  }
};

export const addStudentName = function(addInfo) {
  let studentProfile = userData.findOne({name: addInfo.studentName, type: 'student'});
  let lecturerProfile = userData.findOne({name: addInfo.lecturerName, type: 'lecturer'});
  if(studentProfile && lecturerProfile) {
    userData.update(
      {name: addInfo.lecturerName, type: 'lecturer'},
      {$addToSet: {students: addInfo.studentName}}
    );
    userData.update(
      {name: addInfo.studentName, type: 'student'},
      {$set: {lecturer: addInfo.lecturerName}}
    );
  }
};

export const addWritingProject = function(projectInfo) {
  writingProjects.update(
    {title: projectInfo.title, student: projectInfo.studentName, lecturer: projectInfo.lecturerName},
    {$setOnInsert: {startedAt: new Date(), open: true}},
    {upsert: true}
  );
};

export const submitReplyWriting = function(writingInfo) {
  let project = writingProjects.findOne({title: writingInfo.project});
  if(project && project.open === true) {
    let wordCount = writingInfo.texts.split(' ').length;
    studentWritings.insert({
      project: writingInfo.project,
      texts: writingInfo.texts,
      wordCount: wordCount,
      userType: writingInfo.type,
      student: writingInfo.studentName,
      lecturer: writingInfo.lecturerName,
      comments: '',
      createdAt: new Date(),
      lastEditedAt: null
    });
  }
};

export const closeWritingProject = function(projectTitle) {
  writingProjects.update({title: projectTitle}, {$set: {open: false}});
};

export const checkAns = function(answers) {
  let score = 0;
  /*if(answers.tussock === 1) {
    score += 1;
  }
  if(answers.ambit === 4) {
    score += 1;
  }
  if(answers.apposite === 1) {
    score += 1;
  }*/
  score += answers.tussock === 1 ? 1 : 0;
  score += answers.ambit === 4 ? 1 : 0;
  score += answers.apposite === 1 ? 1 : 0;
  ansRecords.insert({
    name: answers.name,
    score: score,
    submitTime: new Date()
  });
  userData.update({name: answers.name}, {$inc: {score: score}});
};