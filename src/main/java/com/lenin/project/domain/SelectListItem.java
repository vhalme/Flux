package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="entries")
public class SelectListItem implements Serializable {

	private static final long serialVersionUID = -9220599999668987782L;
	
	private int itemIndex;
	private String textValue;
	
	public SelectListItem() {
		
	}

	public int getItemIndex() {
		return itemIndex;
	}

	public void setItemIndex(int itemIndex) {
		this.itemIndex = itemIndex;
	}

	public String getTextValue() {
		return textValue;
	}

	public void setTextValue(String textValue) {
		this.textValue = textValue;
	}
	
	
}
