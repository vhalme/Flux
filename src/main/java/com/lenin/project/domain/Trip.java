package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="trips")
public class Trip implements Serializable {
	
	private static final long serialVersionUID = 601714294140989905L;
	
	@Id
	private String id;
	
	public String displayValue;
	
	public Trip() {
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