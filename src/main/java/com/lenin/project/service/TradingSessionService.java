package com.lenin.project.service;

import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AutoTradingOptions;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/tradingsession")
public class TradingSessionService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TradingSessionRepository tradingSessionRepository;
	

	public TradingSessionService() {
	}
	
	/*
	@GET
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getRefreshData(
			@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId) {

		RequestResponse response = new RequestResponse();

		if (tradingSessionId != null) {

			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);

			RefreshData refreshData = new RefreshData();
			refreshData.setOrders(orderRepository
					.findByTradingSession(tradingSession));
			refreshData.setFundsLeft(tradingSession.getFundsLeft());
			refreshData.setFundsRight(tradingSession.getFundsRight());
			refreshData.setProfitLeft(tradingSession.getProfitLeft());
			refreshData.setProfitRight(tradingSession.getProfitRight());
			refreshData.setRate(tradingSession.getRate());

			response.setData(refreshData);

		} else {
			response.setSuccess(0);
		}

		response.setSuccess(1);

		return response;

	}
	*/

	@GET
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getTradingSession(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId) {

		RequestResponse response = new RequestResponse();

		if (tradingSessionId != null) {
			TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();
			response.setData(tradingSession);
		} else {
			List<TradingSession> tradingSession = tradingSessionRepository.findAll();
			response.setData(tradingSession);
		}

		response.setSuccess(1);

		return response;

	}

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public TradingSession saveUserDetails(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			TradingSession tradingSession) {

		TradingSession dbTradingSession = tradingSessionRepository.findOne(tradingSession
				.getId());

		if (dbTradingSession.getRate() != null) {
			Long rateTime = dbTradingSession.getRate().getTime();
			tradingSession.getRate().setTime(rateTime);
		}

		tradingSessionRepository.save(tradingSession);

		return tradingSession;

	}

	@POST
	@Path("/")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.APPLICATION_JSON })
	public TradingSession addTradingSession(@HeaderParam("User-Id") String userId,
			String currencyPair) {

		System.out.println("new pair: ]" + currencyPair + "[");

		User user = userRepository.findByUsername(userId);

		String[] currencies = currencyPair.split("_");
		TradingSession tradingSession = new TradingSession();
		tradingSession.setAutoTradingOptions(new AutoTradingOptions());
		tradingSession.setCurrencyRight(currencies[0]);
		tradingSession.setCurrencyLeft(currencies[1]);
		tradingSession.setLive(user.getLive());

		Rate rate = new Rate();
		if (user.getLive() == false) {
			rate.setBuy(1.0);
			rate.setSell(1.0);
			rate.setLast(1.0);
		}

		tradingSession.setRate(rate);

		System.out.println("Added new tradestats: "
				+ tradingSession.getCurrencyRight() + "/"
				+ tradingSession.getCurrencyLeft());

		tradingSession = tradingSessionRepository.save(tradingSession);

		user.addTradingSession(tradingSession);
		userRepository.save(user);

		return tradingSession;

	}

	@DELETE
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse deleteTradingSession(
			@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			TradingSession tradingSession) {

		RequestResponse response = new RequestResponse();

		if (tradingSessionId != null) {

			tradingSession = tradingSessionRepository.findOne(tradingSessionId); // user.getCurrentTradingSession();

			User user = userRepository.findByUsername(userId);
			List<TradingSession> tradingSessionList = user.getTradingSessions();
			System.out.println("Deleting from " + tradingSessionList.size()
					+ " tabs");

			int index = -1;
			for (int i = 0; i < tradingSessionList.size(); i++) {
				if (tradingSessionList.get(i).getId().equals(tradingSession.getId())) {
					index = i;
					break;
				}
			}

			if (index != -1) {
				System.out.println("Deleting tradeStat " + tradingSessionId
						+ " at " + index);
				tradingSessionList.remove(index);
			}

			System.out.print("Remaining tradingSession size "
					+ tradingSessionList.size() + " ... ");
			user.setTradingSessions(tradingSessionList);
			
			if (tradingSessionList.size() > 0) {
				user.setCurrentTradingSession(tradingSessionList.get(0));
			}

			user = userRepository.save(user);
			System.out.println(user.getTradingSessions().size());

			tradingSessionRepository.delete(tradingSession);

			response.setSuccess(1);
			response.setData(user.getTradingSessions());

		}

		return response;

	}

	@POST
	@Path("/funds")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse setFunds(@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			@QueryParam("left") Double left, @QueryParam("right") Double right) {

		RequestResponse response = new RequestResponse();

		User user = userRepository.findByUsername(userId);
		Map<String, Double> fundsMap = user.getFunds();

		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);

		if (left != null) {

			Double tsFundsLeft = tradingSession.getFundsLeft();
			String tsCurrencyLeft = tradingSession.getCurrencyLeft();
			Double userFundsLeft = fundsMap.get(tsCurrencyLeft);
			Double changeLeft = tsFundsLeft - left;

			userFundsLeft = userFundsLeft + changeLeft;

			if (userFundsLeft >= 0 || user.getLive() == false) {
				tradingSession.setFundsLeft(left);
				fundsMap.put(tsCurrencyLeft, userFundsLeft);
				user.setFunds(fundsMap);
				userRepository.save(user);
				tradingSessionRepository.save(tradingSession);
				response.setSuccess(1);
				response.setData(fundsMap);
			} else {
				response.setSuccess(0);
				response.setMessage("Not enough funds");
			}

		}

		if (right != null) {

			Double tsFundsRight = tradingSession.getFundsRight();
			String tsCurrencyRight = tradingSession.getCurrencyRight();
			Double userFundsRight = fundsMap.get(tsCurrencyRight);
			Double changeRight = tsFundsRight - right;

			userFundsRight = userFundsRight + changeRight;

			if (userFundsRight >= 0 || user.getLive() == false) {
				tradingSession.setFundsRight(right);
				fundsMap.put(tsCurrencyRight, userFundsRight);
				user.setFunds(fundsMap);
				userRepository.save(user);
				tradingSessionRepository.save(tradingSession);
				response.setSuccess(1);
				response.setData(fundsMap);
			} else {
				response.setSuccess(0);
				response.setMessage("Not enough funds");
			}

		}

		return response;

	}
	
	
	@PUT
	@Path("/autotradingoptions")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse saveAutoTradingOptions(
			@HeaderParam("User-Id") String userId,
			@HeaderParam("TradingSession-Id") String tradingSessionId,
			AutoTradingOptions autoTradingOptions) {

		RequestResponse response = new RequestResponse();

		TradingSession tradingSession = tradingSessionRepository.findOne(tradingSessionId);
		tradingSession.setAutoTradingOptions(autoTradingOptions);

		User user = userRepository.findByUsername(userId);
		user.setCurrentTradingSession(tradingSession);
		userRepository.save(user);

		tradingSessionRepository.save(tradingSession);

		response.setSuccess(1);
		response.setData(autoTradingOptions);

		return response;

	}
	

}
