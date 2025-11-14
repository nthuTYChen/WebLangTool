import './instructor-module.html';

Template.instructorHome.events(
	{
		'click #logout': function() {
			Session.set('browseSession', 'frontPage');
			Session.set('userSession', '');
		}
	}
);