App.AutocompleteController = Ember.ArrayController.extend({
	
	selectedItem: null,
	
	init: function() {
		this.set('content', []);
	},
	
	getValues: function() {
		
	},
	
	selectItem: function(item) {
		
		this.set('selectedItem', item);
		
	}
	
});


App.MapAutocompleteController = App.AutocompleteController.extend({
	
	
	getValues: function(searchString) {
		
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
	    		controller.addObject(Ember.Object.create({ displayValue: results[i].description }));
	    	}
	    	
	    });
		
	}

	
});


App.ResourceAutocompleteController = App.AutocompleteController.extend({
	
	fixture: ['Central Asia with friends', 'Rutenfest 2012'],
	
	getValues: function(searchString) {
		
		this.clear();
		
		var fixture = this.get('fixture');
		
		var matchString = "";
		
		if(searchString != "(none)") {
			matchString = searchString;
		}
		
		//console.log(searchString+"/"+matchString);
		
		for(var i=0; i<fixture.length; i++) {
			if(fixture[i].toLowerCase().indexOf(matchString.toLowerCase()) == 0) {
				this.addObject(Ember.Object.create({ id: "5106cd6456c8b50ed3460b21", displayValue: fixture[i] }));
				//console.log("adding object.......");
			}
		}
		
		
		
	}
	
});


App.AutocompleteInputView = Ember.View.extend({
	
	classNames: [ "placeInput" ],
	
	templateName: 'placeInputViewTemplate',
	
	value: undefined,
	
	searchString: "",
	
	isEditable: true,
	
	isFocused: false,
	
	contentTypeBinding: 'parentView.contentType',
	
	autocompleteVisible: false,
	
	alwaysAutocomplete: false,
	
	autocompleteController: undefined,
	
	InputField: Ember.View.extend({
		
		valueBinding: 'parentView.value',
		
		searchStringBinding: 'parentView.searchString',
		isEditableBinding: 'parentView.isEditable',
		isFocusedBinding: 'parentView.isFocused',
		autocompleteVisibleBinding: 'parentView.autocompleteVisible',
		
		editViewTemplate: Ember.Handlebars.compile('{{view view.InputFieldEdit}}'),
		selectedViewTemplate: Ember.Handlebars.compile('{{#view view.InputFieldSelected}}{{view.displayValue}}{{/view}}'),
		
		InputFieldEdit: Ember.TextField.extend({
			
			valueBinding: 'parentView.searchString',
			
			didInsertElement: function() {
				
				//console.log("inserted edit field");
				
				var parentView = this.get('parentView');
				
				var element = this.$();
				
				parentView.set('isFocused', true);
				
				element.focus(function() {
					parentView.set('isFocused', true);
				});
				
				setTimeout(function() {
					
					//console.log("focusing: ");
					//console.log(element);
					element.focus();
					element.select();
					
				}, 200);
				
				element.blur(function() {
					
					setTimeout(function() {
						
						parentView.set('autocompleteVisible', false);
						
						//var searchString = parentView.get('searchString');
						var selectedItem = parentView.get('value');
						
						if(selectedItem) {
							parentView.set('isEditable', false);
						}
						
						parentView.set('isFocused', false);
						
					}, 200);
				});
				
			},
			
			keyUp: function(event) {
				
				if(event.keyCode == 13) {
					
				} else {
					var parentView = this.get('parentView');
					parentView.set('searchString', this.get('value'));
				}
				
			}
			
		}),
		
		InputFieldSelected: Ember.View.extend({
			
			tagName: 'a',
			
			displayValueBinding: 'parentView.value.displayValue',
			
			click: function() {
				
				var displayValue = this.get('displayValue');
				if(displayValue == "(none)") {
					displayValue = "";
				}
				
				this.set('parentView.searchString', displayValue);
				this.set('parentView.isEditable', true);
			
			}
			
		}),
		
		init: function() {
			
			this._super();
			
			this.set('template', this.get('editViewTemplate'));
			
		},
		
		refreshContent: function() {
			
			var selectedItem = this.get('parentView.value');
			
			if(selectedItem != null) {
				this.set('isEditable', false);
			} else {
				this.set('parentView.searchString', "");
				this.set('isEditable', true);
			}
			
		},
		
		toggleEditability: function() {
			
			var isEditable = this.get('isEditable');
			
			if(isEditable) {
				this.set('template', this.get('editViewTemplate'));
			} else {
				this.set('template', this.get('selectedViewTemplate'));
			}
			
			this.rerender();
			
		}.observes('isEditable'),
		
		handleInputClearing: function() {
			
			var searchString = this.get('searchString');
			
			if(searchString.length == 0) {
				
				this.get('parentView').inputCleared();
				
			}
			
		}.observes('searchString'),
		
		contentChanged: function() {
			//console.log("ctype: "+this.get('parentView.contentType'));
			this.refreshContent();
		}.observes('parentView.contentType')
		
		
	}),
	
	
	AutocompleteView: Ember.View.extend({
		
		classNameBindings: [ 'visible' ],
		
		controllerBinding: 'parentView.autocompleteController',
		
		visibleBinding: 'parentView.autocompleteVisible',
		
		hasSearchString: false,
		
		autocomplete: function() {
			
			var searchString = this.get('parentView').get('searchString');
			
			this.get('controller').getValues(searchString);
			
			if(searchString.length > 0 && searchString != "(none)") {
				
				this.set('visible', true);
				this.set('hasSearchString', true);
				
			} else {
				
				if(this.get('parentView.alwaysAutocomplete') == false) {
					this.set('visible', false);
				}
				
				this.set('hasSearchString', false);
				
			}
			
		}.observes('parentView.searchString'),
		
		toggleVisibility: function() {
			
			//console.log("TOGVIS: "+this.get('parentView.alwaysAutocomplete')+"/"+this.get('parentView.isFocused')+"/"+this.get('parentView.isEditable'));
			
			if(this.get('parentView.alwaysAutocomplete') == true) {
				
				var isEditable = this.get('parentView.isEditable');
				
				if(isEditable == true) {
					this.get('controller').getValues(this.get('parentView.searchString'));
				}
				
				this.set('visible', isEditable);
			
			}
			
		}.observes('parentView.isEditable'),
		
		selectItem: function() {
			
			var item = this.get('controller.selectedItem');
			
			var parentView = this.get('parentView');
			parentView.set('value', item);
			parentView.set('searchString', item.get('displayValue'));
			parentView.set('isEditable', false);
			
			this.set('visible', false);
			
			parentView.handleSelection(item);
			
		}.observes('controller.selectedItem')
		
		
	}),
	
	inputCleared: function() {
		
	},
	
	handleSelection: function(item) {
		
	},
	
	showContent: function() {
		//console.log("input content changed ");
	}.observes('value')
	
});


App.PlaceInputView = App.AutocompleteInputView.extend({
	
	init: function() {
		
		this._super();	
		this.set('controller', Ember.ObjectController.create());
		this.set('autocompleteController', App.MapAutocompleteController.create());
		
	},
		
});

App.TripInputView = App.AutocompleteInputView.extend({
	
	templateName: "tripInputViewTemplate",
	
	nullTrip: Ember.Object.create({ displayValue: "(none)" }),
	
	uneditableWhileTyping: true,
	
	alwaysAutocomplete: true,
	
	init: function() {
		
		this._super();
		this.set('controller', Ember.ObjectController.create());
		this.set('autocompleteController', App.ResourceAutocompleteController.create());
		
	},
	
	inputCleared: function() {
		
		this.set('value', this.get('nullTrip'));
		
	},
	
	handleSelection: function(item) {
		
	}
	
});