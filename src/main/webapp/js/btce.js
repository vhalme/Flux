var API = {
		
		userId: "testUser123",
		tradeStatsId: "1",
		
		changeFunds: function(fund, change, callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/funds?fund="+fund+"&change="+change,
	  			headers: {
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		},
		
		getTradeStats: function(callback) {
		    
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/tradeStats",
	  			headers: {
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
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
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		},
		
		
		cancelTransaction: function(transaction, callback) {
			
			$.ajax({
		    	
				async: false,
		    	type: "POST",
		    	url: "service/transaction?cancel=true",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(transaction),
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
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
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
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(transaction),
		    	success: callback
		    
			});
			
		},
		
		saveCurrentTradeStats: function(tradeStats, callback) {
			
			$.ajax({
				
				async: false,
		    	type: "PUT",
		    	url: "service/tradeStats",
		    	dataType: "json",
	  			contentType: "application/json",
	  			headers: {
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	data: angular.toJson(tradeStats),
		    	success: callback
		    
			});
			
		},
		
		getUser: function(callback) {
			
			$.ajax({
		    	async: false,
		    	type: "GET",
		    	url: "service/user",
	  			headers: {
					"User-Id": this.userId,
					"TradeStats-Id": this.tradeStatsId
		    	},
		    	success: callback
		    });
			
		}
		
		

}



 

