import { Mongo } from 'meteor/mongo';

global.writeProjectDB = new Mongo.Collection('writeProjectDB');

Meteor.publish('writeProjects', function(identity, browseSession) {
   if(browseSession.includes('Home')) {
      return writeProjectDB.find({target: identity});
   }
});

Meteor.publish('singleWriteProject', function(id, identity) {
   return writeProjectDB.find({_id: id, target: identity});
});

Meteor.startup(function() {

});

Meteor.methods(
   {
      addNewProject: async function(projectProfile) {
         projectProfile.version = 1;
         projectProfile.instructorName = 'Tsung-Ying Chen';
         projectProfile.status = 'incomplete';
         projectProfile.target = 'student';
         projectProfile.createdAt = new Date();
         projectProfile.completedAt = null;
         projectProfile.isNew = true;
         writeProjectDB.insertAsync(projectProfile);
      },
      clearNewStatus: function(projectID, identity) {
         writeProjectDB.updateAsync({_id: projectID, target: identity}, {$set: {isNew: false}});
      },
      saveStudentDraft: async function(projectID, essay) {
         let targetProject = 
            await writeProjectDB.findOneAsync({_id: projectID, target: 'student'});
         if(targetProject) {
            if(essay.split(' ').length > targetProject.wordLimit) {
               throw new Meteor.Error('essay-too-long', 'The length of your essay exceeds the limit.')
            }
            else {
               await writeProjectDB.updateAsync({_id: projectID, target: 'student'}, {$set: {essay: essay}});
            }
         }
         return;
      },
      submitStudentDraft: async function(projectID, essay) {
         let targetProject = 
            await writeProjectDB.findOneAsync({_id: projectID, target: 'student'});
         if(targetProject) {
            if(essay.split(' ').length > targetProject.wordLimit) {
               throw new Meteor.Error('essay-too-long', 'The length of your essay exceeds the limit.')
            }
            else {
               await writeProjectDB.updateAsync({_id: projectID, target: 'student'}, 
                  {$set: {essay: essay, status: 'complete', completedAt: new Date()}});
               let newInstructorProject = targetProject;
               delete newInstructorProject._id;
               newInstructorProject.target = 'instructor';
               newInstructorProject.essay = essay;
               newInstructorProject.comments = '';
               newInstructorProject.isNew = true;
               newInstructorProject.createdAt = new Date();
               await writeProjectDB.insertAsync(newInstructorProject);
            }
         }
         return;
      },
      saveInstructorDraft: function(projectID, comments) {
         writeProjectDB.updateAsync({_id: projectID, target: 'instructor'}, {$set: {comments: comments}});
         return;
      },
      submitInstructorDraft: async function(projectID, comments, type) {
         let newStudentProject = 
            await writeProjectDB.findOneAsync({_id: projectID, target: 'instructor'});
         writeProjectDB.updateAsync({_id: projectID, target: 'instructor'}, 
            {$set: {comments: comments, status: 'complete', completedAt: new Date()}});
         delete newStudentProject._id;
         newStudentProject.target = 'student';
         newStudentProject.comments = comments;
         newStudentProject.version++;
         newStudentProject.isNew = true;
         newStudentProject.createdAt = new Date();
         if(type === 'submitAndClose') {
            newStudentProject.status = 'complete';
            newStudentProject.completedAt = new Date();
         }
         await writeProjectDB.insertAsync(newStudentProject);
         return;
      }
   }
);