var App = Ember.Application.create();

App.ApplicationController = Ember.Controller.extend();
App.ApplicationView = Ember.View.extend({
	templateName: 'application'
});

App.ApplicationController = Em.Controller.extend();
App.ApplicationView = Em.View.extend({
	templateName: 'application'
});

App.map = new google.maps.Map(document.getElementById("map"), {});

App.AutocompleteController = Ember.ArrayProxy.extend({
	
	init: function() {
		this.set('content', []);
	},
	
	getNames: function(searchString) {
		
		this.clear();
		
		if(searchString.length == 0) {
			return;
		}
		
		var controller = this;
		
		var service = new google.maps.places.AutocompleteService();
		
	    service.getQueryPredictions({ input: searchString }, function(results, status) {
	    	
	    	for(var i = 0; i < results.length; i++) {
	    		controller.addObject(Ember.Object.create({ placeName: results[i].description }));
	    	}
	    	
	    });
		
	}

});

App.PlaceInputController = Ember.Controller.extend({
	
	direction: undefined,
	selectedPlace: undefined,
	
}),

App.PlaceInputView = Ember.View.extend({
  	
	templateName: 'placeInputViewTemplate',
	
	inputField: Ember.TextField.extend({
		
		keyUp: function(event) {
			
			var autocompleteController = this.get('parentView').get('autocompleteController');
			
			autocompleteController.getNames(this.get('value'));
			
		}
		
	}),
	
	selectPlace: function(event) {
		var place = event.context;
		this.get('controller').set('selectedPlace', place.get('placeName'));
	},
  	
  	autocompleteController: undefined
  	
});

App.FromToInputController = Em.Controller.extend({
	
});

App.FromToInputView = Em.View.extend({
	
	templateName: 'fromToInputViewTemplate',
	
	fromInput: App.PlaceInputView.extend({ 
		controller: App.PlaceInputController.create({ direction: "From" }),
		autocompleteController: App.AutocompleteController.create() 
	}),
	
	toInput: App.PlaceInputView.extend({ 
		controller: App.PlaceInputController.create({ direction: "To" }),
		autocompleteController: App.AutocompleteController.create() 
	}),

});

App.AddEntryController = Em.Controller.extend({
	
});

App.AddEntryView = Em.View.extend({
	
	templateName: 'addEntryViewTemplate',
	
	didInsertElement: function() {
		$("#addEntryAccordion").accordion({ collapsible: true });
	}
	
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
	
	testVal: 'ttt',

	root: Em.Route.extend({
		
		// EVENTS
		viewAddEntry: Ember.Route.transitionTo('addEntry'),
		viewExplore: Ember.Route.transitionTo('explore'),
		
		// STATES
		addEntry: Em.Route.extend({
			
			route: '/',
			
			// EVENTS
			
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

