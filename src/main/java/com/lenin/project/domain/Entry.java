package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

public class Entry implements Serializable {
	
	private static final long serialVersionUID = -6096286190530844035L;
	
	@Id
	private String id;
	
	private SelectListItem type;
	
	private SelectListItem date;
	private String reference;
	
	private Trip trip;
	
	@DBRef
	private Place from;
	
	@DBRef
	private Place to;
	
	private SelectListItem by;
	
	public Entry() {
		
	}
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}



	public SelectListItem getType() {
		return type;
	}
	public void setType(SelectListItem type) {
		this.type = type;
	}
	
	public SelectListItem getDate() {
		return date;
	}
	public void setDate(SelectListItem date) {
		this.date = date;
	}
	
	public String getReference() {
		return reference;
	}
	public void setReference(String reference) {
		this.reference = reference;
	}
	
	public Trip getTrip() {
		return trip;
	}
	public void setTrip(Trip trip) {
		this.trip = trip;
	}
	
	public Place getFrom() {
		return from;
	}
	public void setFrom(Place from) {
		this.from = from;
	}
	
	public Place getTo() {
		return to;
	}
	public void setTo(Place to) {
		this.to = to;
	}
	
	public SelectListItem getBy() {
		return by;
	}
	public void setBy(SelectListItem by) {
		this.by = by;
	}
	
	
}
