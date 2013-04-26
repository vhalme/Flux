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
	
	private Boolean live;
	
	private Boolean save;
	
	private Long time;
	
	private Double rate;
	private Double amount;
	private Double brokerAmount;
	private Double finalAmount;
	private String pair;
	private String type;
	
	private String orderId;
	private Double received = 0.0;
	private Double remains = 0.0;
	private Double filledAmount = 0.0;
	
	
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

	
	public Boolean getLive() {
		return live;
	}


	public void setLive(Boolean live) {
		this.live = live;
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

	
	public Double getBrokerAmount() {
		return brokerAmount;
	}


	public void setBrokerAmount(Double brokerAmount) {
		this.brokerAmount = brokerAmount;
	}


	public Double getFinalAmount() {
		return finalAmount;
	}


	public void setFinalAmount(Double finalAmount) {
		this.finalAmount = finalAmount;
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


	public String getOrderId() {
		return orderId;
	}


	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}


	public Double getReceived() {
		return received;
	}


	public void setReceived(Double received) {
		this.received = received;
	}


	public Double getRemains() {
		return remains;
	}


	public void setRemains(Double remains) {
		this.remains = remains;
	}


	public Double getFilledAmount() {
		return filledAmount;
	}


	public void setFilledAmount(Double filledAmount) {
		this.filledAmount = filledAmount;
	}
	
	

	
}
