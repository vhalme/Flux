package com.lenin.project.domain;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


public class Comment implements Serializable {
	
	private static final long serialVersionUID = -6096286190530844035L;
	
	@Id
	private String id;
	
	
	@DBRef
	private User user;
	
	private String parentId;
	
	private String commentBody;
	
	public Comment() {
		
	}
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}


	public User getUser() {
		return user;
	}


	public void setUser(User user) {
		this.user = user;
	}


	public String getParentId() {
		return parentId;
	}


	public void setParentId(String parentId) {
		this.parentId = parentId;
	}


	public String getCommentBody() {
		return commentBody;
	}


	public void setCommentBody(String commentBody) {
		this.commentBody = commentBody;
	}

	
	
	
}
