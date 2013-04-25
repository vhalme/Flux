package com.lenin.project.domain;

import java.io.Serializable;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class User implements Serializable {
	
	private static final long serialVersionUID = 8124064122670998564L;

	@Id
	private String id;
	
	private Boolean live = false;
	
	private String email;
	private String username;
	private String password;
	
	private Double currentRate = 0.0;
	private Double currentBuyRate = 0.0;
	private Double currentSellRate = 0.0;
	
	private Double oldRate = 0.0;
	
	private Double usd = 0.0;
	private Double ltc = 0.0;
	private Double btc = 0.0;
	private Double profitUsd = 0.0;
	private Double profitLtc = 0.0;
	private Double profitBtc = 0.0;
	
	private Boolean tradeAuto = false;
	private String autoTradingModel = null;
	
	private Double profitTarget = 0.05;
	private Double rateBuffer = 0.001;
	private Double tradeChunk = 10.0;
	private Double sellFloor = 0.0;
	private Double buyCeiling = 0.0;
	
	
	public User() {
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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public Double getUsd() {
		return usd;
	}

	public void setUsd(Double usd) {
		this.usd = usd;
	}

	public Double getLtc() {
		return ltc;
	}

	public void setLtc(Double ltc) {
		this.ltc = ltc;
	}

	public Double getBtc() {
		return btc;
	}

	public void setBtc(Double btc) {
		this.btc = btc;
	}

	public Double getProfitUsd() {
		return profitUsd;
	}

	public void setProfitUsd(Double profitUsd) {
		this.profitUsd = profitUsd;
	}

	public Double getProfitLtc() {
		return profitLtc;
	}

	public void setProfitLtc(Double profitLtc) {
		this.profitLtc = profitLtc;
	}

	public Double getProfitBtc() {
		return profitBtc;
	}

	public void setProfitBtc(Double profitBtc) {
		this.profitBtc = profitBtc;
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
		
		if(fund.equals("usd")) {
			return getUsd();
		} else if(fund.equals("ltc")) {
			return getLtc();
		} else {
			return null;
		}
		
	}
	
	public void setFunds(String fund, Double amount) {
		
		if(fund.equals("usd")) {
			setUsd(amount);
		} else if(fund.equals("ltc")) {
			setLtc(amount);
		}
		
	}
	

}
