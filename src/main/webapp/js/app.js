var App = Ember.Application.create();

App.map = new google.maps.Map(document.getElementById("map"), {});

App.ApplicationController = Ember.Controller.extend();

App.ApplicationView = Ember.View.extend({
		
	templateName: 'application',
	
	title: "Add entry"
	
});

App.NavView = Ember.View.extend({
	
	templateName: 'navViewTemplate'

});

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
	    	
	    	if(results.length == 0) {
	    		results[0] = { description: "No results" }
	    	}
	    	
	    	for(var i = 0; i < results.length; i++) {
	    		controller.addObject(Ember.Object.create({ placeName: results[i].description }));
	    	}
	    	
	    });
		
	}
	
});


App.SelectListController = Ember.ArrayController.extend({
	
	selectedIndex: undefined,
	
	init: function() {
		this.set('content', []);
	}
	
		
});


App.SelectListView = Ember.View.extend({
	
	classNames: [ 'selectList' ],
	
	init: function() {
		
		this._super();
		
		this.set('controller', App.SelectListController.create());
		
	},
	
	didInsertElement: function() {
		
		var itemViews = this.get('childViews');
		
		var controller = this.get('controller');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			var content = itemView.get('element').innerHTML;
			controller.addObject(content);
			
			itemView.set('index', i);
				
		}	
		
	
	},
	
	ItemView: Ember.View.extend({
		
		classNames: [ 'selectListItem' ],
		
		classNameBindings: [ 'selected' ],
		
		index: undefined,
		
		selected: false,
		
		click: function() {
			
			this.set('selected', true);
			
			var controller = this.get('parentView').get('controller');
			controller.set('selectedIndex', this.get('index'));
			
		}
		
	}),
	
	
	changeSelection: function() {
		
		var itemViews = this.get('childViews');
		var controller = this.get('controller');
		var selectedIndex = controller.get('selectedIndex');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			
			if(i != selectedIndex) {
				itemView.set('selected', false);
			}
				
		}
		
	}.observes('controller.selectedIndex')
	
});


App.PlaceInputView = Ember.View.extend({
	
	classNames: [ "placeInput" ],
	
	templateName: 'placeInputViewTemplate',
	
	searchString: "",
	
	isEditable: true,

	InputField: Ember.View.extend({
		
		contentBinding: 'parentView.content',
		
		searchStringBinding: 'parentView.searchString',
		isEditableBinding: 'parentView.isEditable',
		
		editViewTemplate: Ember.Handlebars.compile('{{view view.InputFieldEdit}}'),
		selectedViewTemplate: Ember.Handlebars.compile('{{#view view.InputFieldSelected}}{{view.placeName}}{{/view}}'),
		
		InputFieldEdit: Ember.TextField.extend({
			
			keyUp: function(event) {
				
				if(event.keyCode == 13) {
					
				} else {
					var parentView = this.get('parentView');
					parentView.set('searchString', this.get('value'));
				}
				
			},
			
			valueBinding: 'parentView.content.placeName',
			
		}),
		
		InputFieldSelected: Ember.View.extend({
			
			tagName: 'a',
			
			isEditableBinding: 'parentView.isEditable',
			placeNameBinding: 'parentView.content.placeName',
			
			click: function() {
				this.set('isEditable', true);
			}
			
		}),
		
		init: function() {
			
			this._super();
			
			this.set('template', this.get('editViewTemplate'));
			
		},
		
		toggleEditability: function() {
			
			var isEditable = this.get('isEditable');
			
			if(isEditable) {
				this.set('template', this.get('editViewTemplate'));
			} else {
				this.set('template', this.get('selectedViewTemplate'));
			}
			
			this.rerender();
			
		}.observes('isEditable')
		
	}),
	
	
	AutocompleteView: Ember.View.extend({
		
		classNameBindings: [ 'visible' ],
		
		visible: false,
		
		init: function() {
			
			this._super();
			this.set('controller', App.AutocompleteController.create());
			
		},
		
		autocomplete: function() {
			
			var searchString = this.get('parentView').get('searchString');
			this.get('controller').getNames(searchString);
			
			if(searchString.length > 0) {
				this.set('visible', true);
			} else {
				this.set('visible', false);
			}
			
		}.observes('parentView.searchString'),
		
		
		selectPlace: function(event) {
			
			var parentView = this.get('parentView');
			parentView.set('content', event.context);
			parentView.set('isEditable', false);
			
			this.set('visible', false);
			
		}
		
		
	})
	
});


App.CenterSectionContentView = Ember.View.extend({
	
});

App.AddEntryController = Em.Controller.extend({
	
	from: undefined,
	to: undefined
	
});


App.AddEntryView = Em.View.extend({
	
	controller: App.AddEntryController.create(),
	
	templateName: 'addEntryViewTemplate',
	
	/*
	didInsertElement: function ()
	{
    	
	},
	*/
	
		
	willDestroyElement: function ()
	{
		
		var clone = this.$().clone();
    	this.$().replaceWith(clone);
    	
    	//clone.remove();
    	this.animateOut(clone, this.get('animateOut'));
    	
	
	},
	
	animateOut: function(element, func) {
		
		var elHeight = element.height();
		elHeight = elHeight - 2;
		
		if(elHeight > 50) {
			elHeight = elHeight-2;
			element.height(elHeight);
		}
		
		if(elHeight > 50) {
			
			setTimeout(func, 10, element, func);
		
		} else {
			
			console.log("remove el");
			
			element.css("display", "none");
			element.css("visibility", "hidden");
			element.remove();
			element = null;
			delete element;
			
			
		}
		
	}
	
});


App.ExploreController = Em.Controller.extend({
	title: 'Explore'	
});


App.ExploreView = Em.View.extend({
	templateName: 'exploreViewTemplate'
});


App.TestView = Ember.View.extend({
	
	templateName: 'testViewTemplate',
	
	SubView1: Ember.TextField.extend(),
	SubView2: Ember.View.extend( { tagName: 'a' } ),
	
	
	SubView: Ember.View.extend({
		
		init: function() {
			
			this._super();
			
			this.set('view1', this.get('myView1'));
			this.set('view2', this.get('myView2'));
			
			this.set('template', this.get('template1'));
			
		},
		
		view1: undefined,
		myView1Binding: 'parentView.SubView1',
		
		view2: undefined,
		myView2Binding: 'parentView.SubView2',
		
		template1: Ember.Handlebars.compile('gg {{#view view.view1}} hh {{/view}}'),
		template2: Ember.Handlebars.compile('gg {{#view view.view2}} rr {{/view}}'),
		
		
		click: function() {
			
			this.set('template', this.get('template2'));
			
			/*
			this.set('myViewBinding', 'parentView.SubView2');
			var newView = this.get('myView');
			this.set('view', newView);
			
			var template = Ember.Handlebars.compile('gg {{#view view.view}} rr {{/view}}');
			this.set('template', template);
			*/
			
			this.rerender();
				
		}
		
	})
	
		
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
			
			// EVENTS
			
			connectOutlets: function(router, context) {
				router.get('applicationController').connectOutlet('addEntry');
			}

			
		}),
		
		explore: Em.Route.extend({
			
			route: '/',
			
			connectOutlets: function(router, context) {
				router.get('applicationController').connectOutlet('explore');
			}
			
		})
		
	})
	
});

App.initialize();

