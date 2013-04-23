package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class Transaction extends BtceApiCall implements Serializable {
	
	
	private static final long serialVersionUID = 2034644454740810443L;
	
	@DBRef
	private User user;
	
	@DBRef
	private Transaction reverseTransaction;
	
	
	private Boolean save;
	
	private Long time;
	
	private Double rate;
	private Double amount;
	private String pair;
	private String type;
	
	
	public Transaction() {
		
	}

	
	public User getUser() {
		return user;
	}


	public void setUser(User user) {
		this.user = user;
	}

	

	public Transaction getReverseTransaction() {
		return reverseTransaction;
	}


	public void setReverseTransaction(Transaction reverseTransaction) {
		this.reverseTransaction = reverseTransaction;
	}


	public Boolean getSave() {
		return save;
	}


	public void setSave(Boolean save) {
		this.save = save;
	}

	

	public Long getTime() {
		return time;
	}


	public void setTime(Long time) {
		this.time = time;
	}


	public Double getRate() {
		return rate;
	}


	public void setRate(Double rate) {
		this.rate = rate;
	}


	public Double getAmount() {
		return amount;
	}


	public void setAmount(Double amount) {
		this.amount = amount;
	}


	public String getPair() {
		return pair;
	}


	public void setPair(String pair) {
		this.pair = pair;
	}


	public String getType() {
		return type;
	}


	public void setType(String type) {
		this.type = type;
	}

	
	
}
