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
	
	
	
	

}
