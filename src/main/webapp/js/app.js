var App = Ember.Application.create();

App.ApplicationController = Ember.Controller.extend();
App.ApplicationView = Ember.View.extend({
	templateName: 'application'
});

App.ApplicationController = Em.Controller.extend();
App.ApplicationView = Em.View.extend({
	templateName: 'application'
});

App.placeInputController = Ember.ArrayProxy.create({
	content: ["Tashkent", "Bukhara", "Samarkand", "Khujand"]
});

App.PlaceInputView = Ember.TextField.extend({
	
	classNames: ['placeInput'],
	
	didInsertElement: function() {
		//console.log($(this));
		$('.placeInput').autocomplete({ source: ['AA', 'BB', 'CC'] });
  	},
  	
  	controllerBinding: 'App.placeInputController'
  	
});

App.AddEntryController = Em.Controller.extend({
	title: 'Add entry'
});

App.AddEntryView = Em.View.extend({
	
	templateName: 'addEntryViewTemplate',
	fromInput: App.PlaceInputView
	
});

App.ExploreController = Em.Controller.extend({
	title: 'Explore'	
});

App.ExploreView = Em.View.extend({
	templateName: 'exploreViewTemplate'
});


App.Router = Em.Router.extend({
	
	enableLogging: true,
	
	location: 'hash',

	root: Em.Route.extend({
		
		// EVENTS
		viewAddEntry: Ember.Route.transitionTo('addEntry'),
		viewExplore: Ember.Route.transitionTo('explore'),
		
		// STATES
		addEntry: Em.Route.extend({
			
			route: '/',
			
			connectOutlets: function(router, context) {
				router.get('applicationController').connectOutlet('addEntry');
			},
			
			
			// STATES
			index: Em.Route.extend({
				
				route: '/',
				connectOutlets: function(router, context) {
					router.get('applicationController').connectOutlet('addEntry');
				}
				
			})

			
		}),
		
		explore: Em.Route.extend({
			
			route: '/',
			
			connectOutlets: function(router, context) {
				router.get('applicationController').connectOutlet('explore');
			},

			
			// STATES
			index: Em.Route.extend({
				
				route: '/',
				connectOutlets: function(router, context) {
					router.get('applicationController').connectOutlet('explore');
				}
				
			})
			
		})
		
	})
	
});

App.initialize();
