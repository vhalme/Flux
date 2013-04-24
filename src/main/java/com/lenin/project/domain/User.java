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
	
	private Boolean live;
	
	private String email;
	private String username;
	private String password;
	
	private Double usd = 2.0;
	private Double ltc = 3.0;
	private Double btc = 4.0;
	private Double profitUsd = 5.0;
	private Double profitLtc = 6.0;
	private Double profitBtc = 7.0;
	
	private Double profitTarget = 0.05;
	private Double rateBuffer = 0.001;
	private Double tradeChunk = 10.0;
	private Double sellFloor = 2.5;
	private Double buyCeiling = 2.5;
	
	
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
