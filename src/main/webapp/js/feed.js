App.FeedController = Ember.ArrayController.extend({
	
	init: function() {
		this.set('content', []);
	},
	
	getContent: function(tags) {
		
		var query = "";
		
		for(var i=0; i<tags.length; i++) {
			
			query += "%23"+tags[i];
			
			if(i < tags.length-1) {
				query += " OR ";
			}
			
		}
		
		console.log("QUERY: "+query);
		
		this.clear();
		
		var controller = this;
		
		$.ajax({  
			
			url : "https://search.twitter.com/search.json?q="+query+"&lang=en&callback=?",
			dataType : "json",  
			timeout:15000,  
			
			success : function(data)  {  
				
				var results = data.results;
              
				for(var i=0; i<results.length; i++) {
					
					console.log(results[i]);
					
					var post = results[i];
					var text = post.text;
					
					var urlIndex = text.indexOf("http://");
					
					if(urlIndex != -1) {
						
						var text1 = text.substring(0, urlIndex);
						var text2 = text.substring(urlIndex, text.length);
						
						var spaceIndex = text2.indexOf(" ");
						var urlEnd = spaceIndex != -1 ? spaceIndex : text2.length;
						var url = text2.substring(0, urlEnd);
						var text3 = text2.substring(urlEnd);
						var finalText = text1 + "<a href=\""+url+"\">"+url+"</a>" + text3;
						post.text = finalText;
						
						
					}
					
					var feedItemView = Ember.View.create({
						
						image: post.profile_image_url,
						from: post.from_user_name,
						date: post.created_at.substring(0, 22),
						
  						template: Ember.Handlebars.compile(post.text)
					
					});
					
					controller.addObject(feedItemView);      	
				
				}
			},  
			
			error : function(error)  
			{
				console.log("Failure!");
				console.log(error);
			},
    });  
		
	}
	
});


App.FeedView = Ember.View.extend({
	
	init: function() {
		this._super();
		this.set('controller', App.FeedController.create());
	},
	
	didInsertElement: function() {
		
		this.get('controller').getContent(["Helsinki"]);
		
	},
	
	searchTagsChanged: function() {
		
		this.get('controller').getContent(App.controller.get('searchTags'));
		
	}.observes('App.controller.searchTags')
	
});