package com.lenin.project.domain;

import java.io.Serializable;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="routes")
public class Route implements Serializable {
	
	private static final long serialVersionUID = -4394235106266490700L;

	@Id
	private String id;
	
	@DBRef
	private Place from;
	
	@DBRef
	private Place to;
	
	public Route() {
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
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
	
	
	

}
