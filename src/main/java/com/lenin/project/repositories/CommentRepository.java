package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {
	
	List<Comment> findByParentId(String parentId);
	
	List<Comment> findAll();
	
	Comment save(Comment comment);
	
	void delete(Comment comment);
	
	void deleteAll();
	
	
	
}
