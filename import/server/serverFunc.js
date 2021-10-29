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
  userData.update(
      {name: profile.name, type: profile.type},
      {$set: {gender: profile.gender, age: profile.age}, 
        $setOnInsert: {score: 0, createdAt: new Date()}},
      {upsert: true}
    );
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