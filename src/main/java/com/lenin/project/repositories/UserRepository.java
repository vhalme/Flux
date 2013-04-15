package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.User;

public interface UserRepository extends MongoRepository<User, String> {
	
	List<User> findAll();
	
	User save(User user);
	
	void delete(User user);
	
	void deleteAll();
	
	
	
}
