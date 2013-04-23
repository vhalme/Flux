package com.lenin.project.domain;

import java.io.Serializable;
import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class RateQuote implements Serializable {
	
	private static final long serialVersionUID = 2564403728524688276L;

	@Id
	private String id;

	private Date date;
	
	private String pair;
	private Double last;
	private Double buy;
	private Double sell;
	
	public RateQuote() {
		
	}
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}


	public Date getDate() {
		return date;
	}


	public void setDate(Date date) {
		this.date = date;
	}


	public String getPair() {
		return pair;
	}


	public void setPair(String pair) {
		this.pair = pair;
	}


	public Double getLast() {
		return last;
	}


	public void setLast(Double last) {
		this.last = last;
	}


	public Double getBuy() {
		return buy;
	}


	public void setBuy(Double buy) {
		this.buy = buy;
	}


	public Double getSell() {
		return sell;
	}


	public void setSell(Double sell) {
		this.sell = sell;
	}

	
	
	
}
