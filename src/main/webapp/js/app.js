var App = Ember.Application.create();

App.ApplicationController = Ember.Controller.extend();
App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
});

App.initialize();

App.PlaceInputController = Ember.Controller.extend({
	
	city: undefined
	
});

App.PageView = Ember.View.extend({
	
	header: App.HeaderView,
	
	content: App.ContentView,
	
	footer: App.FooterView
	
});


App.HeaderView = Ember.View.extend({	
	
	tagName: "header"

});

App.PlaceInputView = Ember.TextField.extend({

});

App.LeftSectionView = Ember.View.extend({
	
	menuTitle: "I have travelled from",
	
	placeInput: App.PlaceInputView
	
	
});

App.CenterSectionView = Ember.View.extend({
	
});

App.ContentView = Ember.View.extend({
	
	leftSection: App.LeftSectionView,
	centerSection: App.CenterSectionView
	
});


App.FooterView = Ember.View.extend({	

	tagName: "footer"
		
});


/*
App.Person = DS.Model.extend({
	
	firstName: DS.attr('string'),
	lastName: DS.attr('string'),

	fullName: function() {
		
		return 
			this.get('firstName') +
	        " " + this.get('lastName');
	  
	}.property('firstName', 'lastName')
	
});

App.peopleController = Em.ArrayController.create({
	content: App.Person.findAll()
});
*/
