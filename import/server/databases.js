import { Mongo } from 'meteor/mongo';

// Global variable
userData = new Mongo.Collection('userData');
ansRecords = new Mongo.Collection('ansRecords');