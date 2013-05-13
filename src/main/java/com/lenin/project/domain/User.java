package com.lenin.project.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
	
	private String authToken;
	
	private Map<String, Double> funds = new HashMap<String, Double>();
	private Map<String, String> accounts = new HashMap<String, String>();
	private Map<String, String> addresses = new HashMap<String, String>();
	
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

	public Map<String, Double> getFunds() {
		return funds;
	}

	public void setFunds(Map<String, Double> funds) {
		this.funds = funds;
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
	
	public String getAuthToken() {
		return authToken;
	}

	public void setAuthToken(String authToken) {
		this.authToken = authToken;
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

	
	public Map<String, String> getAccounts() {
		return accounts;
	}

	public void setAccounts(Map<String, String> accounts) {
		this.accounts = accounts;
	}

	public Map<String, String> getAddresses() {
		return addresses;
	}

	public void setAddresses(Map<String, String> addresses) {
		this.addresses = addresses;
	}

	public void addTradeStats(TradeStats newTradeStats) {
		tradeStats.add(newTradeStats);
	}

}
