package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.repositories.RateRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;

@Service
@Path("/rate")
public class RateService {

	@Context
    private org.apache.cxf.jaxrs.ext.MessageContext mc; 
	
	@Autowired
	private TradingSessionRepository tradingSessionRepository;

	@Autowired
	private RateRepository rateRepository;

	@Autowired
	private AuthComponent authComponent;
	
	@Autowired
	private MongoTemplate mongoTemplate;
	

	public RateService() {
	}


	@GET
	@Path("/")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getRates(@QueryParam("pair") String pair,
			@QueryParam("setType") String setType,
			@QueryParam("from") Long from, @QueryParam("until") Long until, 
			@QueryParam("testSessionId") String testSessionId, @QueryParam("service") String service) {

		// System.out.println(pair+"/"+setType+"/"+from+"/"+until);

		RequestResponse response = new RequestResponse();

		List<Rate> rates = new ArrayList<Rate>();
		
		if(pair != null && setType != null && from != null && until != null && service != null) {
			
			Query searchRates = new Query(Criteria.where("setType").is(setType).andOperator(
					Criteria.where("service").is(service),
					Criteria.where("pair").is(pair),
					Criteria.where("time").gt(from),
					Criteria.where("time").lte(until)
				)).with(new Sort(Direction.ASC, "time"));
		
			rates = mongoTemplate.find(searchRates, Rate.class);
			
			//rates = rateRepository.findByPairAndSetTypeAndTimeBetweenOrderByTimeAsc(pair, setType, from, until);
			
		} else if (pair != null && from != null && until != null) {
			rates = rateRepository.findByPairAndTimeBetweenOrderByTimeAsc(
					pair, from, until);
		} else if (pair != null && from != null) {
			rates = rateRepository
					.findByPairAndTimeGreaterThanOrderByTimeAsc(pair, from);
		} else if (pair != null && until != null) {
			rates = rateRepository.findByPairAndTimeLessThanOrderByTimeAsc(
					pair, until);
		} else {
			rates = rateRepository.findAll();
		}
		
		/*
		for(int i=0; i<10000; i++) {
			rates.add(new Rate());
		}
		*/
		
		response.setSuccess(1);
		response.setData(rates);

		return response;

	}

	
	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse setRate(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@HeaderParam("Trading-Session-Id") String tradingSessionId, Rate rate) {

		RequestResponse response = authComponent.getInitialResponse(username, mc, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);
		
		if(tradingSession.getLive() == false) {
			
			rate.setId(null);
			rate.setService("test");
			rate.setSetType(null);
			rate.setTime(System.currentTimeMillis() / 1000L);
			rate.setTestSessionId(tradingSession.getId());
			//rateRepository.save(rate);
			
			tradingSession.setRate(rate);
			mongoOps.updateFirst(new Query(Criteria.where("_id").is(new ObjectId(tradingSession.getId()))),
					new Update().set("rate", rate), TradingSession.class);
			
			//tradingSessionRepository.save(tradingSession);
			
			response.setSuccess(1);
			response.setData(rate);

		} else {
			response.setSuccess(0);
		}

		return response;

	}


}
