package com.lenin.project.service;

import java.io.Serializable;
import java.util.List;

import com.lenin.tradingplatform.data.entities.Order;
import com.lenin.tradingplatform.data.entities.Rate;

public class RefreshData implements Serializable {

	private static final long serialVersionUID = 2610594290222395205L;
	
	private List<Order> orders;
	private Double fundsLeft;
	private Double fundsRight;
	private Double profitLeft;
	private Double profitRight;
	
	private Rate rate;
	
	public RefreshData() {
		
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
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

	public Rate getRate() {
		return rate;
	}

	public void setRate(Rate rate) {
		this.rate = rate;
	}
	
	

}
