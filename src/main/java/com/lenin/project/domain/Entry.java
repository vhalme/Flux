package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class Entry implements Serializable {
	
	private static final long serialVersionUID = -6096286190530844035L;
	
	@Id
	private String id;
	
	private SelectListItem type;
	
	private SelectListItem date;
	private String reference;
	
	@DBRef
	private Trip trip;
	
	@DBRef
	private Route route;
	
	private SelectListItem by;
	
	private String byId;
	private String byDepTime;
	private String byArrTime;
	private String byAddDays;
	private String scheduleInfo;
	private String cost;
	private String depDateYear;
	private String depDateMonth;
	private String depDateDay;
	
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
	
	public Route getRoute() {
		return route;
	}
	public void setRoute(Route route) {
		this.route = route;
	}
	
	public SelectListItem getBy() {
		return by;
	}
	public void setBy(SelectListItem by) {
		this.by = by;
	}


	public String getById() {
		return byId;
	}


	public void setById(String byId) {
		this.byId = byId;
	}


	public String getByDepTime() {
		return byDepTime;
	}


	public void setByDepTime(String byDepTime) {
		this.byDepTime = byDepTime;
	}


	public String getByArrTime() {
		return byArrTime;
	}


	public void setByArrTime(String byArrTime) {
		this.byArrTime = byArrTime;
	}


	public String getByAddDays() {
		return byAddDays;
	}


	public void setByAddDays(String byAddDays) {
		this.byAddDays = byAddDays;
	}


	public String getScheduleInfo() {
		return scheduleInfo;
	}


	public void setScheduleInfo(String scheduleInfo) {
		this.scheduleInfo = scheduleInfo;
	}
	

	public String getCost() {
		return cost;
	}


	public void setCost(String cost) {
		this.cost = cost;
	}
	
	
	public String getDepDateYear() {
		return depDateYear;
	}


	public void setDepDateYear(String depDateYear) {
		this.depDateYear = depDateYear;
	}


	public String getDepDateMonth() {
		return depDateMonth;
	}


	public void setDepDateMonth(String depDateMonth) {
		this.depDateMonth = depDateMonth;
	}


	public String getDepDateDay() {
		return depDateDay;
	}


	public void setDepDateDay(String depDateDay) {
		this.depDateDay = depDateDay;
	}


	
	
}
