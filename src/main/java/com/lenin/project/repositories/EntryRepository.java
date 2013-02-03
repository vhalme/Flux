package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.StubData;
import com.lenin.project.domain.Trip;

public interface EntryRepository extends MongoRepository<Entry, String> {

	List<Entry> findAll();
	
	Entry save(Entry entry);
	
	void delete(Entry entry);
	
	void deleteAll();
	
	
}
