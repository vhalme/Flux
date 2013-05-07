package com.lenin.project.service;

import java.io.Serializable;
import java.util.List;

import com.lenin.project.domain.TickerQuote;
import com.lenin.project.domain.Transaction;

public class RefreshData implements Serializable {

	private static final long serialVersionUID = 2610594290222395205L;
	
	private List<Transaction> transactions;
	private Double fundsLeft;
	private Double fundsRight;
	
	private TickerQuote rate;
	
	public RefreshData() {
		
	}

	public List<Transaction> getTransactions() {
		return transactions;
	}

	public void setTransactions(List<Transaction> transactions) {
		this.transactions = transactions;
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

	public TickerQuote getRate() {
		return rate;
	}

	public void setRate(TickerQuote rate) {
		this.rate = rate;
	}
	
	

}
