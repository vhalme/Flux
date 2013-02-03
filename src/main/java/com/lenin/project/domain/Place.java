package com.lenin.project.domain;

import java.io.Serializable;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

public class Place implements Serializable {
	
	private static final long serialVersionUID = -1171859637013720134L;
	
	@Id
	private String id;
	
	public String displayValue;
	
	public Place() {
	}
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	
	public String getDisplayValue() {
		return displayValue;
	}

	public void setDisplayValue(String displayValue) {
		this.displayValue = displayValue;
	}
	
	

}
