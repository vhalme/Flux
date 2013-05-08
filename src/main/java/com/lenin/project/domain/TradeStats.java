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
	
	private TickerQuote rate;
	
	private Double oldRate = 0.0;
	
	private Double fundsLeft = 0.0;
	private Double fundsRight = 0.0;
	private Double profitLeft = 0.0;
	private Double profitRight = 0.0;
	
	private AutoTradingOptions autoTradingOptions;
	
	
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

	public TickerQuote getRate() {
		return rate;
	}

	public void setRate(TickerQuote rate) {
		this.rate = rate;
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
	
	public AutoTradingOptions getAutoTradingOptions() {
		return autoTradingOptions;
	}

	public void setAutoTradingOptions(AutoTradingOptions autoTradingOptions) {
		this.autoTradingOptions = autoTradingOptions;
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
