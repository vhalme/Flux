package com.lenin.project.service;

public class RequestResponse {
	
	private Integer success;
	private String message;
	private Object data;
	
	public RequestResponse() {
		
	}

	public Integer getSuccess() {
		return success;
	}

	public void setSuccess(Integer success) {
		this.success = success;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}
	
	

}
