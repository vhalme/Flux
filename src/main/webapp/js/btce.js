var API = {
		
		userId: "testUser123",
		
		changeFunds: function(fund, change, callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/funds?fund="+fund+"&change="+change,
	  			headers: {
					"User-Id": this.userId
		    	},
		    	success: callback
		    });
			
		},
		
		getInfo: function(callback) {
		
			var params = {
		      method : "getInfo",
		    };
		    
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/info",
	  			headers: {
					"User-Id": this.userId
		    	},
		    	success: callback
		    });
			
			
		},
		
		getRates: function(callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/rates",
	  			headers: {
					"User-Id": this.userId
		    	},
		    	success: callback
		    });
			
			
		},
		
		getTransactions: function(callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/transaction",
	  			headers: {
					"User-Id": this.userId
		    	},
		    	success: callback
		    });
			
		},
		
		
		postTransaction: function(transaction, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/transaction",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    	
		    });
			
		},
		
		deleteTransaction: function(transaction, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "DELETE",
		    	url: "service/transaction",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    
			});
			
		}
		

}



 

