App.ListItemController = Ember.ObjectController.extend({
	
	init: function() {
		this.set('content', App.ListItemContent.create({
			data: {}
		}));
	}
	
});

App.ListItemContent = Ember.Object.extend({
	
	data: null,
	
	textValueBinding: 'data.textValue',
	itemIndexValue: 'data.itemIndex'
	
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
		
		this.get('parentView').set('value', this.get('controller.content.data'));
		
	}
		
});


App.SelectListView = Ember.View.extend({
	
	classNames: [ 'selectList' ],
	
	selectedItem: null,
	
	value: undefined,
	
	didInsertElement: function() {
		
		var itemViews = this.get('childViews');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			
			itemView.set('controller.content.data.itemIndex', i);
			
			this.setupItemContent(itemView.get('controller.content'), itemView);
			
		}
		
		this.valueChanged();
		
	},
	
	changeSelection: function(index) {
		
		var itemViews = this.get('childViews');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			if(i != index) {
				itemView.set('selected', false);
			}
			
		}
		
	},
	
	valueChanged: function() {
		
		var itemIndex = -1;
		
		var value = this.get('value');
		
		if(value != undefined) {
			itemIndex = value.itemIndex;
		}
		
		var itemViews = this.get('childViews');
		
		for(var i=0; i<itemViews.length; i++) {
			
			var itemView = itemViews[i];
			
			if(i != itemIndex) {
				itemView.set('selected', false);
			} else {
				var itemContent = itemView.get('controller.content');
				itemContent.set('data', value);
				this.set('selectedItem', itemContent);
				itemView.set('selected', true);
			}
			
		}
		
		var selectedItem = this.get('selectedItem');
		
		if(selectedItem != null) {
			this.handleSelection(selectedItem);
		}
		
	}.observes('value'),
	
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