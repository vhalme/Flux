package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.TradeStats;
import com.lenin.project.domain.User;

public interface TradeStatsRepository extends MongoRepository<TradeStats, String> {
	
	List<TradeStats> findAll();
	
	TradeStats save(TradeStats tradeStats);
	
	void delete(TradeStats tradeStats);
	
	void deleteAll();
	
	
	
}
