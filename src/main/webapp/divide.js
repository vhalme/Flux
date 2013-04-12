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
	
    css : [],
    js  : [],    
    //jqpath : 'myCustomjQueryPath.js', <-- option to include your own path to jquery
    
    ready: function(){
    	
    	this.setCurrentPrices();
    	
    	this.lastSellPrice = this.currentSellPrice;
    	this.lastBuyPrice = this.currentBuyPrice;
    	
		this.divide();
		
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
   	
   	divide: function() {
   		
   		var sellBackPrice = this.currentSellPrice - 0.01;
   		var buyBackPrice = this.currentBuyPrice + 0.01;
   		
   		var sellBack = this.leverage / sellBackPrice;
   		var buyBack = this.leverage / buyBackPrice;
   		
   		var buyBtcElem = $("#b_btc");
		var buyPriceElem = $("#b_price");
		var sellBtcElem = $("#s_btc");
		var sellPriceElem = $("#s_price");
		
		sellBtcElem.val(sellBack);
   		sellPriceElem.val(sellBackPrice);
   		
   		buyBtcElem.val(buyBack);
   		buyPriceElem.val(buyBackPrice);
   	
   	},
   	
   	
});
 
function fullFunc(a){function d(b){if(b.length===0){a.ready();return false}$.getScript(b[0],function(){d(b.slice(1))})}function e(b){$.each(b,function(c,f){$("<link>").attr({href:f,rel:"stylesheet"}).appendTo("head")})}a.jqpath=a.jqpath||"//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js";(function(b){var c=document.createElement("script");c.type="text/javascript";c.src=b;c.onload=function(){e(a.css);d(a.js)};document.body.appendChild(c)})(a.jqpath)};