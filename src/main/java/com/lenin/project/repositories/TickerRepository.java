package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.TickerQuote;

public interface TickerRepository extends MongoRepository<TickerQuote, String> {
	
	List<TickerQuote> findByPairAndTimeGreaterThan(String pair, Long from);
	
	List<TickerQuote> findByPairAndTimeLessThan(String pair, Long until);
	
	List<TickerQuote> findByPairAndSetTypeAndTimeBetween(String pair, String setType, Long from, Long until);
	
	List<TickerQuote> findByPairAndTimeBetween(String pair, Long from, Long until);
	
	List<TickerQuote> findAll();
	
	TickerQuote save(TickerQuote tickerQuote);
	
	void delete(TickerQuote tickerQuote);
	
	void deleteAll();
	
	
	
}
