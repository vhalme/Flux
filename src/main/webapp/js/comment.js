App.Comment = App.Model.extend({
	
	path: "comment",
	
	idBinding: 'data.id',
	commentBodyBinding: 'data.commentBody'
	
	
});

App.Comment.reopenClass({
	path: "comment"
});


App.CommentsController = Ember.ArrayController.extend({
	
	parentId: undefined,
	commentBody: "",
	
	init: function() {
		this.set('content', []);
	},
	
	getComments: function(parentId) {
		
		this.set('parentId', parentId);
		
		console.log("comments for: "+parentId);
		
		this.clear();
		
		var controller = this;
		
		$.get("service/comment?parentId="+parentId, function(data) {
			
			for(var i=0; i<data.length; i++) {
				
				controller.addObject(data[i]);
				
			}
			
		});  
		
	},
	
	postComment: function() {
		
		var parentId = this.get('parentId');
		var commentBody = this.get('commentBody');
		
		var comment = App.Comment.create(
				{ 
					data: { 
						parentId: parentId, 
						commentBody: commentBody 
					} 
				});
		
		var controller = this;
		
		comment.save(function(data) {
			console.log("comment saved");
			controller.getComments(parentId);
			controller.set('commentBody', "");
		});
		
	}
	
});

App.CommentsView = Ember.View.extend({
	
	templateName: 'comments',
	
	parentIdBinding: 'parentView.controller.content.id',

	init: function() {
		this._super();
		this.set('controller', App.CommentsController.create());
	},
	
	parentIdSet: function() {
		
		var parentId = this.get('parentId');
		console.log("parent id set: "+parentId);
		if(parentId != undefined) {
			this.get('controller').getComments(parentId);
		}
		
	}.observes('parentId')
	
});