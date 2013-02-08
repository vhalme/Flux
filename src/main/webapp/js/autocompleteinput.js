App.AutocompleteController = Ember.ArrayController.extend({
	
	selectedItem: null,
	
	searchString: "",
	
	//value: undefined,
	
	init: function() {
		this.set('content', []);
	},
	
	getValues: function() {
		
	},
	
	selectItem: function(item) {
		
		this.set('selectedItem', item);
		
		this.handleSelection(item);
		
	},
	
	handleSelection: function(item) {
		
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
	    		console.log(results[i]);
	    		controller.addObject(Ember.Object.create({ displayValue: results[i].description }));
	    	}
	    	
	    });
		
	},
	
	handleSelection: function(item) {
		
		var displayValue = item.get('displayValue');
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode( { 'address': displayValue }, function(results, status) {
		
			if(status == google.maps.GeocoderStatus.OK) {
				
				//console.log("GEOCODE RESULTS: "+results.length);
				//console.log(results);
				var lat = results[0].geometry.location.lat();
				var lng = results[0].geometry.location.lng();
				item.set('lat', lat);
				item.set('lng', lng);
				
				//console.log(results[0].geometry.location);
				//console.log(lat+"/"+lng);
				
				
				/*
		        map.setCenter(results[0].geometry.location);
		        
		        var marker = new google.maps.Marker({
		            map: map,
		            position: results[0].geometry.location
		        });
		        */
				
			} else {
		        alert("Geocode was not successful for the following reason: " + status);
		    }
		   
		});
		
	}

	
});


App.ResourceAutocompleteController = App.AutocompleteController.extend({
	
	resource: undefined,
	
	getValues: function(searchString) {
		
		//console.log("getValues("+searchString+")");
		
		this.clear();
		
		var matchString = "";
		
		if(searchString != "(none)") {
			matchString = searchString;
		}
		
		var controller = this;
		
		$.get(this.get('resource'), function(data) {
			console.log(data);
			for(var i=0; i<data.length; i++) {
				if(data[i].displayValue.toLowerCase().indexOf(matchString.toLowerCase()) == 0) {
					controller.addObject(data[i]);
				}
			}
		});
		
		
		
	},
	
	handleSelection: function(item) {
		console.log(item);
	}
	
});

App.TripAutocompleteController = App.ResourceAutocompleteController.extend({
	
	saveTrip: function() {
		var tripName = this.get('searchString');
		console.log("SAVE TRIP: "+tripName);
		this.selectItem(App.Trip.create( { displayValue: tripName } ));
	}
	
});


App.AutocompleteInputView = Ember.View.extend({
	
	classNames: [ "placeInput" ],
	
	templateName: 'placeInputViewTemplate',
	
	value: undefined,
	
	searchStringBinding: 'autocompleteController.searchString',
	
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
					//element.focus();
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
			console.log("ctype: "+this.get('parentView.contentType'));
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
				var searchString = this.get('parentView.searchString');
				
				if(isEditable == true && searchString.length == 0) {
					this.get('controller').getValues(searchString);
				}
				
				this.set('visible', isEditable);
			
			}
			
		}.observes('parentView.isEditable'),
		
		selectItem: function() {
			
			var item = this.get('controller.selectedItem');
			
			var parentView = this.get('parentView');
			parentView.set('value', item);
			parentView.set('searchString', item.displayValue);
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
		this.set('autocompleteController', App.TripAutocompleteController.create({
			resource: "/TravellerLog/service/trip"
		}));
		
	},
	
	inputCleared: function() {
		
		this.set('value', this.get('nullTrip'));
		
	},
	
	handleSelection: function(item) {
		
	}
	
});


App.StoredPlaceInputView = App.AutocompleteInputView.extend({
	
	init: function() {
		
		this._super();
		this.set('controller', Ember.ObjectController.create());
		this.set('autocompleteController', App.ResourceAutocompleteController.create({
			resource: "/TravellerLog/service/place"
		}));
		
	},
	
	handleSelection: function(item) {
		
	}
	
});