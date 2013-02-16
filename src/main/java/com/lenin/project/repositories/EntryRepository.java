package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.Entry;
import com.lenin.project.domain.Place;

public interface EntryRepository extends MongoRepository<Entry, String> {
	
	List<Entry> findByFrom(Place from);
	
	List<Entry> findByTo(Place to);
	
	//@Query(value="{ 'from' : ?0 }")
	List<Entry> findByFromAndTo(Place from, Place to);
	
	List<Entry> findAll();
	
	Entry save(Entry entry);
	
	void delete(Entry entry);
	
	void deleteAll();
	
	
}
