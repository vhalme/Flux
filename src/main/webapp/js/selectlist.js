App.ListItemController = Ember.ObjectController.extend({
	
	init: function() {
		this.set('content', Ember.Object.create());
	}
	
});

App.ListItemView = Ember.View.extend({
	
	classNames: [ 'selectListItem' ],
		
	classNameBindings: [ 'selected' ],
		
	index: undefined,
	
	selected: false,
	
	init: function() {
		
		this._super();
		this.set('controller', App.ListItemController.create());
	
	},
	
	click: function() {
			
		this.set('selected', true);
		this.get('parentView').set('selectedItem', this.get('controller'));
		
	}
		
});


App.SelectListView = Ember.View.extend({
	
	classNames: [ 'selectList' ],
	
	selectedItem: undefined,
	
	value: undefined,
	
	didInsertElement: function() {
		
		var itemViews = this.get('childViews');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			
			itemView.set('controller.content.itemIndex', i);
			
			this.setupItemContent(itemView.get('controller.content'), itemView);
			
		}
		
	},
	
	changeSelection: function() {
		
		var itemViews = this.get('childViews');
		var selectedItem = this.get('selectedItem');
		var selectedItemIndex = selectedItem.get('itemIndex');
		
		this.set('value', selectedItem.get('content'));
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			if(i != selectedItemIndex) {
				itemView.set('selected', false);
			}
			
		}
		
		this.handleSelection(selectedItem);
		
		
	}.observes('selectedItem'),
	
	setupItemContent: function(itemContent, itemView) {
		
	},
	
	handleSelection: function(selectedItem) {
		
	}
	
	
});

App.TextSelectListView = App.SelectListView.extend({
	
	setupItemContent: function(itemContent, itemView) {
		
		var textValue = itemView.$().text();
		itemContent.set('textValue', textValue);
		
	}
	
});

App.EntryTypeSelectView = App.TextSelectListView.extend({
	
	handleSelection: function(selectedItem) {
		
		var textValue = selectedItem.get('textValue');
		
	}
	
});


App.TransportTypeSelectView = App.TextSelectListView.extend({
	
	handleSelection: function(selectedItem) {
		
		var textValue = selectedItem.get('textValue');
		
		
	}
	
});