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
	
	selectedPlace: "aaa",
	
	content: "ggg"
	
}),


App.PlaceInputView = Ember.View.extend({
  	
	//controllerBinding: this.searchString,
	
	classNames: [ "placeInput" ],
	
	templateName: 'placeInputViewTemplate',
	
	searchString: undefined,
	
	selectedPlace: "hhh",
	
	inputField: Ember.TextField.extend({
		
		keyUp: function(event) {
			
			if(event.keyCode == 13) {
				this.get('parentView').set('controller', this.get('value'));
			} else {
				this.get('parentView').set('searchString', this.get('value'));
			}
			
		}
		
	}),
	
	selectPlace: function(event) {
		var place = event.context;
		this.get('controller').set('selectedPlace', place.get('placeName'));
	},
	
	autocompleteView: Ember.View.extend({
		
		init: function() {
			
			this._super();
			this.set('controller', App.AutocompleteController.create());
		
		},
		
		autocomplete: function() {
			
			var searchString = this.get('parentView').get('searchString');
			this.get('controller').getNames(searchString);
			
		}.observes('parentView.searchString')
		
	})
	
});

App.AddEntryController = Em.Controller.extend({
	
	from: "f",
	to: "t"
	
});

App.AddEntryView = Em.View.extend({
	
	controller: App.AddEntryController.create(),
	
	templateName: 'addEntryViewTemplate'
	
});

App.ExploreController = Em.Controller.extend({
	title: 'Explore'	
});

App.ExploreView = Em.View.extend({
	templateName: 'exploreViewTemplate'
});


App.TestView = Ember.View.extend({
	
	templateName: 'testViewTemplate',
	
	testVal: "ttt1",
	searchString: "ttt4",
	
	click: function(event) {
		this.set('searchString', "jkkj");
	},
	
	testFunc: function() {
		console.log(this.get('subView'));
	},
	
	subView: Ember.View.extend({
		
		init: function() {
			
			this._super();
			
			var controller = Ember.ArrayController.extend({
				init: function() {
					this.set('content', ['3' ,'4']);
				}
			}).create();
			
			this.set('controller', controller);
		},
		
		autocomplete: function() {
			var word = this.get('parentView').get('searchString');
			this.get('controller').addObject(word);
		}.observes('parentView.searchString'),
		
		controller: undefined
		
	}),
	
	controller: Ember.ArrayController.create({ content: ['1', '2'] })
		
}),

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

