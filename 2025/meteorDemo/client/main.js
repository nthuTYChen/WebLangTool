import { Template } from 'meteor/templating';

import './main.html';

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

/*(Template.updateVar.onCreated(
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