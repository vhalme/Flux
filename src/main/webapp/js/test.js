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
			this.rerender();
				
		}
		
	})
	
		
});