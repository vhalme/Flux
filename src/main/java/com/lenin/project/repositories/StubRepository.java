package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.StubData;

public interface StubRepository extends MongoRepository<StubData, String> {

	List<StubData> findAll();
	
	StubData save(StubData source);
	
	void delete(StubData source);
	
	
}
