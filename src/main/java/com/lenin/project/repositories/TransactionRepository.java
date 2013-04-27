package com.lenin.project.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lenin.project.domain.TradeStats;
import com.lenin.project.domain.Transaction;
import com.lenin.project.domain.User;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
	
	Transaction findByOrderId(String orderId);
	
	List<Transaction> findByTradeStats(TradeStats tradeStats);
	
	List<Transaction> findByTradeStatsAndType(TradeStats tradeStats, String type);
	
	List<Transaction> findAll();
	
	Transaction save(Transaction transaction);
	
	void delete(Transaction transaction);
	
	void deleteAll();
	
	
	
}
