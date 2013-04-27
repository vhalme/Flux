package com.lenin.project.domain;

import java.io.Serializable;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class TradeStats implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -820345864243515844L;

	@Id
	private String id;
	
	private Boolean live = false;
	
	private String pair;
	private String currencyLeft;
	private String currencyRight;
	
	private Double currentRate = 0.0;
	private Double currentBuyRate = 0.0;
	private Double currentSellRate = 0.0;
	
	private Double oldRate = 0.0;
	
	private Double fundsLeft = 0.0;
	private Double fundsRight = 0.0;
	private Double profitLeft = 0.0;
	private Double profitRight = 0.0;
	
	private Boolean tradeAuto = false;
	private String autoTradingModel = null;
	
	private Double profitTarget = 0.05;
	private Double rateBuffer = 0.001;
	private Double tradeChunk = 10.0;
	private Double sellFloor = 0.0;
	private Double buyCeiling = 0.0;
	
	
	public TradeStats() {
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public Boolean getLive() {
		return live;
	}

	public void setLive(Boolean live) {
		this.live = live;
	}
	
	public String getCurrencyLeft() {
		return currencyLeft;
	}

	public void setCurrencyLeft(String currencyLeft) {
		this.currencyLeft = currencyLeft;
	}

	public String getCurrencyRight() {
		return currencyRight;
	}

	public void setCurrencyRight(String currencyRight) {
		this.currencyRight = currencyRight;
	}

	public Double getCurrentRate() {
		return currentRate;
	}

	public void setCurrentRate(Double currentRate) {
		this.currentRate = currentRate;
	}

	public Double getCurrentBuyRate() {
		return currentBuyRate;
	}

	public void setCurrentBuyRate(Double currentBuyRate) {
		this.currentBuyRate = currentBuyRate;
	}

	public Double getCurrentSellRate() {
		return currentSellRate;
	}

	public void setCurrentSellRate(Double currentSellRate) {
		this.currentSellRate = currentSellRate;
	}

	public Double getOldRate() {
		return oldRate;
	}

	public void setOldRate(Double oldRate) {
		this.oldRate = oldRate;
	}

	public Double getFundsLeft() {
		return fundsLeft;
	}

	public void setFundsLeft(Double fundsLeft) {
		this.fundsLeft = fundsLeft;
	}

	public Double getFundsRight() {
		return fundsRight;
	}

	public void setFundsRight(Double fundsRight) {
		this.fundsRight = fundsRight;
	}

	public Double getProfitLeft() {
		return profitLeft;
	}

	public void setProfitLeft(Double profitLeft) {
		this.profitLeft = profitLeft;
	}

	public Double getProfitRight() {
		return profitRight;
	}

	public void setProfitRight(Double profitRight) {
		this.profitRight = profitRight;
	}

	public Boolean getTradeAuto() {
		return tradeAuto;
	}

	public void setTradeAuto(Boolean tradeAuto) {
		this.tradeAuto = tradeAuto;
	}

	
	public String getAutoTradingModel() {
		return autoTradingModel;
	}

	public void setAutoTradingModel(String autoTradingModel) {
		this.autoTradingModel = autoTradingModel;
	}

	public Double getProfitTarget() {
		return profitTarget;
	}

	public void setProfitTarget(Double profitTarget) {
		this.profitTarget = profitTarget;
	}
	
	public Double getRateBuffer() {
		return rateBuffer;
	}

	public void setRateBuffer(Double rateBuffer) {
		this.rateBuffer = rateBuffer;
	}

	public Double getTradeChunk() {
		return tradeChunk;
	}

	public void setTradeChunk(Double tradeChunk) {
		this.tradeChunk = tradeChunk;
	}

	
	public Double getSellFloor() {
		return sellFloor;
	}

	public void setSellFloor(Double sellFloor) {
		this.sellFloor = sellFloor;
	}

	public Double getBuyCeiling() {
		return buyCeiling;
	}

	public void setBuyCeiling(Double buyCeiling) {
		this.buyCeiling = buyCeiling;
	}

	public Double getFunds(String fund) {
		
		if(fund.equals("left")) {
			return getFundsLeft();
		} else if(fund.equals("right")) {
			return getFundsRight();
		} else {
			return null;
		}
		
	}
	
	public void setFunds(String fund, Double amount) {
		
		if(fund.equals("left")) {
			setFundsLeft(amount);
		} else if(fund.equals("right")) {
			setFundsRight(amount);
		}
		
	}
	
	public String getPair() {
		return currencyRight+"_"+currencyLeft;
	}
 	

}
