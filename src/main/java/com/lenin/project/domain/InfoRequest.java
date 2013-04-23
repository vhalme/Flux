package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class InfoRequest extends BtceApiCall implements Serializable {
	
	private static final long serialVersionUID = 4197854442620213604L;
	
	public InfoRequest() {
	}
	
	
}
