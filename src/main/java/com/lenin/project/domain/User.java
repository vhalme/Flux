package com.lenin.project.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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
	
	@DBRef
	private List<TradeStats> tradeStats = new ArrayList<TradeStats>();
	
	@DBRef
	private TradeStats currentTradeStats;
	
	
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

	public List<TradeStats> getTradeStats() {
		return tradeStats;
	}

	public void setTradeStats(List<TradeStats> tradeStats) {
		this.tradeStats = tradeStats;
	}

	public TradeStats getCurrentTradeStats() {
		return currentTradeStats;
	}

	public void setCurrentTradeStats(TradeStats currentTradeStats) {
		this.currentTradeStats = currentTradeStats;
	}
	
	public Double getFunds(String fund) {
		
		if(fund.equals("left")) {
			return currentTradeStats.getFundsLeft();
		} else if(fund.equals("right")) {
			return currentTradeStats.getFundsRight();
		} else {
			return null;
		}
		
	}
	
	public void setFunds(String fund, Double amount) {
		
		if(fund.equals("left")) {
			currentTradeStats.setFundsLeft(amount);
		} else if(fund.equals("right")) {
			currentTradeStats.setFundsRight(amount);
		}
		
	}

	public void addTradeStats(TradeStats newTradeStats) {
		tradeStats.add(newTradeStats);
	}

}
