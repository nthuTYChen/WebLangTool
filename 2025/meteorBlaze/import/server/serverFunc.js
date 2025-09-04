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

export const addUpdateProfile = async function (profile) {
  if(profile.type === 'student') {
    await userData.upsertAsync(
      {name: profile.name, type: profile.type},
      {$set: {gender: profile.gender, age: profile.age}, 
        $setOnInsert: {score: 0, createdAt: new Date()}}
    );
  }
  else {
    await userData.upsertAsync(
      {name: profile.name, type: profile.type},
      {$setOnInsert: {students: [], createdAt: new Date()}}
    );
  }
};

export const addStudentName = async function(addInfo) {
  let studentProfile = await userData.findOneAsync({name: addInfo.studentName, type: 'student'});
  let lecturerProfile = await userData.findOneAsync({name: addInfo.lecturerName, type: 'lecturer'});
  if(studentProfile && lecturerProfile) {
    await userData.updateAsync(
      {name: addInfo.lecturerName, type: 'lecturer'},
      {$addToSet: {students: addInfo.studentName}}
    );
    await userData.updateAsync(
      {name: addInfo.studentName, type: 'student'},
      {$set: {lecturer: addInfo.lecturerName}}
    );
  }
};

export const addWritingProject = async function(projectInfo) {
  await writingProjects.upsertAsync(
    {title: projectInfo.title, 
     description: projectInfo.description,
     student: projectInfo.studentName, 
     lecturer: projectInfo.lecturerName
    },
    {$setOnInsert: {startedAt: new Date(), open: true}}
  );
};

export const removeWritingProject = async function(projectInfo) {
  await writingProjects.removeAsync({
    title: projectInfo.title, 
    student: projectInfo.studentName, 
    lecturer: projectInfo.lecturerName
  });
  await studentWritings.removeAsync({
    project: projectInfo.title, 
    student: projectInfo.studentName, 
    lecturer: projectInfo.lecturerName
  });
};

export const submitReplyWriting = async function(writingInfo) {
  let project = await writingProjects.findOneAsync({title: writingInfo.project});
  if(project && project.open === true) {
    let wordCount = writingInfo.texts && writingInfo.texts.split(' ').length;
    if(writingInfo.save) {
      if(writingInfo.comments) {
        await studentWritings.updateAsync({_id: writingInfo.id}, 
                             {$set: 
                                {comments: writingInfo.comments, 
                                  lastEditedAt: new Date()
                                }
                             }
        );
      }
      else {
        await studentWritings.updateAsync({_id: writingInfo.id}, 
                             {$set: 
                                {texts: writingInfo.texts, 
                                  wordCount: wordCount, 
                                  lastEditedAt: new Date()
                                }
                             }
        );
      }
    }
    else {
      await studentWritings.insertAsync({
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
  }
};

export const closeWritingProject = async function(closeInfo) {
  await writingProjects.updateAsync({_id: closeInfo.target}, {$set: {open: false, rating: closeInfo.rating, closedAt: new Date()}});
};

export const checkAns = async function(answers) {
  let score = 0;
  score += answers.tussock === 1 ? 1 : 0;
  score += answers.ambit === 4 ? 1 : 0;
  score += answers.apposite === 1 ? 1 : 0;
  await ansRecords.insertAsync({
    name: answers.name,
    score: score,
    submitTime: new Date()
  });
  await userData.updateAsync({name: answers.name}, {$inc: {score: score}});
};