/**
 * FLUX engine
 *
 */
 
window.bookmarklet = function(opts){fullFunc(opts)};
 
window.bookmarklet({
	
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
		
		this.setCurrentPrices();
		
		this.lastSellPrice = this.currentSellPrice;
		this.lastBuyPrice = this.currentBuyPrice;

		var context = this;

		setInterval(function() { context.loop(context); }, 1000);

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

		console.log("BUY: "+this.currentBuyPrice+", SELL: "+this.currentSellPrice);
	
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
				
			if(sellPrice >= price && value.substring(0,1) != "x") {
					
				calculatedSellAmount += value;
				console.log("sellAmount += "+value);
				
				this.sellBuffer[price] = "x"+value;
			
			}
				
					
		}
			
		if(calculatedSellAmount > 0) {
			sellAmount = calculatedSellAmount;
		}
			
		var buyAmount = this.usd / 2;
		var calculatedBuyAmount = 0;
			
		for(var price in this.buyBuffer) {
				
			var value = this.buyBuffer[price];
				
			if(buyPrice <= price && value.substring(0,1) != "x") {
					
				calculatedBuyAmount += value;
				console.log("buyAmount += "+value);
				
				this.sellBuffer[price] = "x"+value;
				
			}
				
		}
			
		if(calculatedBuyAmount > 0) {
			buyAmount = calculatedBuyAmount;
		}
		
		console.log("set val "+buyAmount+" to buy");
		console.log(buyBtcElem);
		//buyBtcElem.val(buyAmount);
		//buyPriceElem.val(buyPrice);
		
		console.log("set val "+sellAmount+" to sell");
		console.log(sellBtcElem);
		//sellBtcElem.val(sellAmount);
		//sellPriceElem.val(sellPrice);
		
	
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
			
			
	}
			
   	
});
 
function fullFunc(a){function d(b){if(b.length===0){a.ready();return false}$.getScript(b[0],function(){d(b.slice(1))})}function e(b){$.each(b,function(c,f){$("<link>").attr({href:f,rel:"stylesheet"}).appendTo("head")})}a.jqpath=a.jqpath||"//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js";(function(b){var c=document.createElement("script");c.type="text/javascript";c.src=b;c.onload=function(){e(a.css);d(a.js)};document.body.appendChild(c)})(a.jqpath)};