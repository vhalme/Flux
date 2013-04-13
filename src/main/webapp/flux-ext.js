var app = {
		
			leverage: 40,
	
			usd: 0,
			ltc: 0,
	
			lastSellPrice: 0,
			lastBuyPrice: 0,
	
			currentSellPrice: 0,
			currentBuyPrice: 0,
	
			suggestedSellPrice: 0,
			suggestedBuyPrice: 0,
			
			buyBuffer: [],
			sellBuffer: [],
	
    		css : [],
    		js  : [],
    		//jqpath : 'myCustomjQueryPath.js', <-- option to include your own path to jquery
    
    		ready: function() {
    			
    			this.updatePrices();
    			this.setCurrentPrices();
    	
    			this.lastSellPrice = this.currentSellPrice;
    			this.lastBuyPrice = this.currentBuyPrice;
    	
    			var context = this;
    	
				//setInterval(function() { context.loop(context); }, 1000);
		
   			},
   	
   			loop: function(context) {
   		
   				context.setCurrentPrices();
				context.calcSuggestedPrices();
		
   			},
   	
   			setCurrentPrices: function() {
   		
   				var usdElem = $("#cur1");
				var ltcElem = $("#cur2");
		
   				var minPriceElem = $("#min_price");
				var maxPriceElem = $("#max_price");
		
				var minPriceStr = minPriceElem.text();
				var maxPriceStr = maxPriceElem.text();
		
				var usdStr = usdElem.text();
				var ltcStr = ltcElem.text();
		
				this.currentSellPrice = parseFloat(maxPriceStr);
				this.currentBuyPrice = parseFloat(minPriceStr);
		
				this.usd = parseFloat(usdStr);
				this.ltc = parseFloat(ltcStr);
		
				console.log("SELL: "+this.currentSellPrice+", BUY: "+this.currentBuyPrice);
   		
   			},
   	
   			calcSuggestedPrices: function() {
   		
   				var buyBtcElem = $("#b_btc");
				var buyPriceElem = $("#b_price");
				var sellBtcElem = $("#s_btc");
				var sellPriceElem = $("#s_price");
		
   				var sellMargin = this.currentBuyPrice - this.lastSellPrice;
   				var buyMargin = this.lastBuyPrice - this.currentSellPrice;
   				
   				$("#sell_margin").html(""+sellMargin);
   				$("#buy_margin").html(""+buyMargin);
   				
   				var sellPrice = this.currentSellPrice;
   				var buyPrice = this.currentBuyPrice;
   				
   				var sellAmount = this.ltc / 2;
   				var calculatedSellAmount = 0;
   				
   				for(var price in this.sellBuffer) {
   					
   					var value = this.sellBuffer[price];
   					
   					if(sellPrice >= price) {
   						
   						calculatedSellAmount += value;
   						console.log("sellAmount += "+value);
   						
   						delete this.sellBuffer[price];
   					}
   					
   						
   				}
   				
   				if(calculatedSellAmount > 0) {
   					sellAmount = calculatedSellAmount;
   				}
   				
   				var buyAmount = this.usd / 2;
   				var calculatedBuyAmount = 0;
   				
   				for(var price in this.buyBuffer) {
   					
   					var value = this.buyBuffer[price];
   					
   					if(buyPrice <= price) {
   						
   						calculatedBuyAmount += value;
   						console.log("buyAmount += "+value);
   						
   						delete this.buyBuffer[price];
   					}
   					
   				}
   				
   				if(calculatedBuyAmount > 0) {
   					buyAmount = calculatedBuyAmount;
   				}
   				
   				sellBtcElem.val(sellAmount);
   				sellPriceElem.val(sellPrice);
   		
   				buyBtcElem.val(buyAmount);
   				buyPriceElem.val(buyPrice);
   		
   			},
   	
   			divide: function() {
   		
   				var sellBackPrice = this.currentSellPrice - 0.01;
   				var buyBackPrice = this.currentBuyPrice + 0.01;
   		
   				var sellBack = this.leverage / sellBackPrice;
   				var buyBack = this.leverage * buyBackPrice;
   		
   				var buyBtcElem = $("#b_btc");
				var buyPriceElem = $("#b_price");
				var sellBtcElem = $("#s_btc");
				var sellPriceElem = $("#s_price");
		
				sellBtcElem.val(sellBack);
   				sellPriceElem.val(sellBackPrice);
   		
   				buyBtcElem.val(buyBack);
   				buyPriceElem.val(buyBackPrice);
   	
   			},
   			
   			updatePrices: function() {
   				
   				var usdVal = $("#cur1_in").val();
   				var ltcVal = $("#cur2_in").val();
   				$("#cur1").html(usdVal);
   				$("#cur2").html(ltcVal);
   				
   				var minPriceVal = $("#min_price_in").val();
   				var maxPriceVal = $("#max_price_in").val();
   				$("#min_price").html(minPriceVal);
				$("#max_price").html(maxPriceVal);
				
				this.setCurrentPrices();
   				
   			},
   			
   			buy: function() {
   				
   				var buyAmount = parseFloat($("#b_btc").val());
   				var buyPrice = parseFloat($("#b_price").val());
   				
   				this.sellBuffer[this.lastBuyPrice] = buyAmount;
   				console.log("SB");
   				console.log(this.sellBuffer);
   				
   				this.lastBuyPrice = buyPrice;
   				this.lastSellPrice = buyPrice;
   				
   				var priceInUsd = buyAmount * buyPrice;
   				
   				var usdVal = parseFloat($("#cur1_in").val());
   				var newUsdVal = usdVal - priceInUsd;
   				$("#cur1_in").val(newUsdVal);
   				
   				var ltcVal = parseFloat($("#cur2_in").val());
   				var newLtcVal = ltcVal + buyAmount;
   				$("#cur2_in").val(newLtcVal);
   				
   				this.updatePrices();
   				this.setCurrentPrices();
   				
   			},
   			
   			sell: function() {
   				
   				var sellAmount = parseFloat($("#s_btc").val());
   				var sellPrice = parseFloat($("#s_price").val());
   				
   				var valueInUsd = sellAmount * sellPrice;
   				
   				this.buyBuffer[this.lastSellPrice] = valueInUsd;
   				console.log("BB");
   				console.log(this.buyBuffer);
   				
   				this.lastBuyPrice = sellPrice;
   				this.lastSellPrice = sellPrice;
   				
   				var usdVal = parseFloat($("#cur1_in").val());
   				var newUsdVal = usdVal + valueInUsd;
   				$("#cur1_in").val(newUsdVal);
   				
   				var ltcVal = parseFloat($("#cur2_in").val());
   				var newLtcVal = ltcVal - sellAmount;
   				$("#cur2_in").val(newLtcVal);
   				
   				this.updatePrices();
   				this.setCurrentPrices();
   				
   			}
   			
   		};


document.addEventListener('DOMContentLoaded', function () {
	  
	var updateBtn = document.getElementById("updateBtn");
	var suggestBtn = document.getElementById("suggestBtn");
    
	updateBtn.onclick = app.updatePrices;
	suggestBtn.onclick = app.calcSuggestedPrices;
	
	app.ready();

});
