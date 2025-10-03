import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';
import '../lib/client/session.js';

Template.body.helpers(
  {
    returnSessionVar: function() {
      return Session.get('sessionVar');
    }
  }
);

Template.body.events(
  {
    'click input.loadTemplate': function(event) {
      let buttonId = event.currentTarget.id;
      Session.set('sessionVar', buttonId);
    }
  }
);

Template.test.onCreated(
  function() {
    this.templateVar = 0;
    console.log(this.templateVar);
    //alert('test template created!');
  }
);

Template.test.helpers(
  {
    returnTemplateVar: function() {
      return Template.instance().templateVar;
    },
    addTemplateVar: function(num) {
      let newNum = Template.instance().templateVar + num;
      return newNum;
    }
  }
);

Template.test.events(
  {
    'mouseover div': function() {
      alert('Mouse is here over DIV!');
    },
    'click input': function(event, instances) {
      let currentTemplateVar = instances.templateVar;
      console.log(currentTemplateVar + 1);
    }
  }
);

/*Template.updateVar.onCreated(
  function() {
    this.templateVar = 0;
  }
);

Template.updateVar.events(
  {
    'click input': function(event, instances) {
      let newValue = instances.templateVar + 1;
      let spanEm = document.getElementsByTagName('span');
      spanEm[0].innerHTML = newValue;
      instances.templateVar = newValue;
    }
  }
);*/

Template.updateVar.onCreated(
  function() {
    this.templateVar = new ReactiveVar(0);
  }
);

Template.updateVar.helpers(
  {
    returnTemplateVar: function() {
      return Template.instance().templateVar.get();
    }
  }
);

Template.updateVar.events(
  {
    'click input#addOne': function(event, instances) {
      let currentVal = instances.templateVar.get();
      instances.templateVar.set(currentVal + 1);
    }
  }
);