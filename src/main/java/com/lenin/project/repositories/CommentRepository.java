package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.lenin.project.domain.Comment;
import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;
import com.lenin.project.domain.Route;

public interface CommentRepository extends MongoRepository<Comment, String> {
	
	List<Comment> findByParentId(String parentId);
	
	List<Comment> findAll();
	
	Comment save(Comment comment);
	
	void delete(Comment comment);
	
	void deleteAll();
	
	
	
}
