package com.lenin.project.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.lenin.project.AuthComponent;
import com.lenin.project.util.PasswordHash;
import com.lenin.tradingplatform.client.BitcoinApi;
import com.lenin.tradingplatform.client.RequestResponse;
import com.lenin.tradingplatform.data.entities.AccountFunds;
import com.lenin.tradingplatform.data.entities.AutoTradingOptions;
import com.lenin.tradingplatform.data.entities.FundTransaction;
import com.lenin.tradingplatform.data.entities.PropertyMap;
import com.lenin.tradingplatform.data.entities.Rate;
import com.lenin.tradingplatform.data.entities.ServiceInfo;
import com.lenin.tradingplatform.data.entities.Settings;
import com.lenin.tradingplatform.data.entities.TradingSession;
import com.lenin.tradingplatform.data.entities.User;
import com.lenin.tradingplatform.data.repositories.OrderRepository;
import com.lenin.tradingplatform.data.repositories.TradeRepository;
import com.lenin.tradingplatform.data.repositories.TradingSessionRepository;
import com.lenin.tradingplatform.data.repositories.UserRepository;

@Service
@Path("/")
public class RootService {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private TradeRepository tradeRepository;

	@Autowired
	private TradingSessionRepository tradingSessionRepository;

	@Autowired
	private AuthComponent authComponent;
	
	
	public RootService() {
	}

	
	@POST
	@Path("/btcrpc")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse btcApiCall(@HeaderParam("Username") String username, @HeaderParam("Auth-Token") String authToken,
			@QueryParam("method") String method, List<Object> params) {

		System.out.println(method + ": " + params + "/" + params.size());

		RequestResponse response = authComponent.getInitialResponse(username, authToken);
		
		if(response.getSuccess() < 0) {
			return response;
		}

		User user = userRepository.findByUsername(username);

		List<String> clientParams = new ArrayList<String>();

		BitcoinApi api = new BitcoinApi("127.0.0.1", 8332, "fluxltc1", "fLuxThuyu1eP");
		
		if (method.equals("sendfrom")) {
			
			AccountFunds accountFunds = user.getAccountFunds();
			Map<String, Double> reserves = accountFunds.getReserves();
			Double availableAmount = reserves.get(params.get(0));

			String currency = (String)params.get(0);
			String toAddress = (String)params.get(1);
			Double amount = Double.parseDouble((String)params.get(2));
			
			if (availableAmount >= amount) {

				String fromAccount = accountFunds.getAccountName();

				clientParams.add(fromAccount);
				clientParams.add(toAddress);
				clientParams.add("" + amount);

				JSONObject result = api.exec(method, params);

				try {
					System.out.println(result.get("result"));
				} catch (Exception e) {
					e.printStackTrace();
				}

			}

		}


		response.setData(user);
		response.setSuccess(1);

		return response;

	}

	
	@POST
	@Path("/login")
	@Consumes({ MediaType.TEXT_PLAIN })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse login(@HeaderParam("Username") String username, @HeaderParam("Email") String email, @QueryParam("reg") String reg,
			String password) {
		
		MongoOperations mongoOps = (MongoOperations)mongoTemplate;
		
		RequestResponse response = new RequestResponse();

		User user = userRepository.findByUsername(username);
		
		Long nowTime = System.currentTimeMillis();
		
		if (user != null) {
			
			Boolean pwdOk = false;
			
			try {
			
				pwdOk = PasswordHash.validatePassword(password, user.getPassword());
				
			} catch(Exception e) {
				e.printStackTrace();
			}
			
			if(pwdOk == true) {
				
				User testUser = userRepository.findByUsername(email + " (test)");
			
				String token = "" + Math.random();

				user.setAuthToken(token);
				user.setLastActivity(nowTime);
				
				testUser.setAuthToken(token);
				testUser.setLastActivity(nowTime);
				
				userRepository.save(user);
				userRepository.save(testUser);

				System.out.println("Logging in user " + email);
				response.setSuccess(1);

			} else {
				
				System.out.println("Incorrect password " + password+"/"+user.getPassword());
				response.setMessage("Wrong password.");
				response.setSuccess(0);
				
			}
			
		} else {
			
			if(reg == null) {
				response.setSuccess(2);
				return response;
			}
			
			System.out.println("Creating user " + email);
			
			user = new User();
			user.setUsername(email);
			
			try {
				
				String pwdHash = PasswordHash.createHash(password);
				user.setPassword(pwdHash);
				
			} catch(Exception e) {
				e.printStackTrace();
			}
			
			user.setLive(true);
			user.setLastActivity(nowTime);
			
			System.out.println("userId="+user.getId());
			
			AccountFunds accountFunds = new AccountFunds();
			
			PropertyMap btceServiceInfo = new PropertyMap();
			btceServiceInfo.setName("BTC-E");
			Map<String, Object> btceServiceStrings = new HashMap<String, Object>();
			btceServiceStrings.put("apiKey", "");
			btceServiceStrings.put("apiSecret", "");
			btceServiceInfo.setProperties(btceServiceStrings);
			//Map<String, Double> btceServiceDoubles = new HashMap<String, Double>();
			//btceServiceDoubles.put("usd", 0.0);
			//btceServiceDoubles.put("btc", 0.0);
			//btceServiceDoubles.put("ltc", 0.0);
			//btceServiceInfo.setDoubleProperties(btceServiceDoubles);
			
			PropertyMap mtgoxServiceInfo = new PropertyMap();
			mtgoxServiceInfo.setName("Mt. Gox");
			Map<String, Object> mtgoxServiceStrings = new HashMap<String, Object>();
			mtgoxServiceStrings.put("apiKey", "");
			mtgoxServiceStrings.put("apiSecret", "");
			mtgoxServiceInfo.setProperties(mtgoxServiceStrings);
			//Map<String, Double> mtgoxServiceDoubles = new HashMap<String, Double>();
			//mtgoxServiceDoubles.put("usd", 0.0);
			//mtgoxServiceDoubles.put("btc", 0.0);
			//mtgoxServiceInfo.setDoubleProperties(mtgoxServiceDoubles);
			
			Map<String, PropertyMap> serviceInfos = new HashMap<String, PropertyMap>();
			serviceInfos.put("btce", btceServiceInfo);
			serviceInfos.put("mtgox", mtgoxServiceInfo);
			
			accountFunds.setServiceProperties(serviceInfos);
			
			Map<String, Double> reserves = new HashMap<String, Double>();
			reserves.put("usd", 0.0);
			reserves.put("ltc", 0.0);
			reserves.put("btc", 0.0);
			accountFunds.setReserves(reserves);
			
			Map<String, Map<String, Double>> activeFunds = new HashMap<String, Map<String, Double>>();
			Map<String, Double> activeMtgoxFunds = new HashMap<String, Double>();
			activeMtgoxFunds.put("usd", 0.0);
			activeMtgoxFunds.put("ltc", 0.0);
			activeMtgoxFunds.put("btc", 0.0);
			activeFunds.put("mtgox", activeMtgoxFunds);
			Map<String, Double> activeBtceFunds = new HashMap<String, Double>();
			activeBtceFunds.put("usd", 0.0);
			activeBtceFunds.put("ltc", 0.0);
			activeBtceFunds.put("btc", 0.0);
			activeFunds.put("btce", activeBtceFunds);
			Map<String, Double> activeTestFunds = new HashMap<String, Double>();
			activeTestFunds.put("usd", 0.0);
			activeTestFunds.put("ltc", 0.0);
			activeTestFunds.put("btc", 0.0);
			activeFunds.put("test", activeTestFunds);
			accountFunds.setActiveFunds(activeFunds);
			
			user.setAccountFunds(accountFunds);
			
			createAddress("btc", accountFunds);
			createAddress("ltc", accountFunds);
			
			AutoTradingOptions autoTradingOptions = new AutoTradingOptions();
			TradingSession tradingSession = new TradingSession();
			//tradingSession.setUser(user);
			tradingSession.setCurrencyLeft("usd");
			tradingSession.setCurrencyRight("ltc");
			tradingSession.setService("btce");
			tradingSession.setLive(true);
			tradingSession.setAutoTradingOptions(autoTradingOptions);
			Rate rate = new Rate();
			rate.setTime(System.currentTimeMillis() / 1000L);
			rate.setPair("ltc_usd");
			tradingSession.setRate(rate);

			User testUser = new User();
			testUser.setLastActivity(nowTime);
			testUser.setUsername(email + " (test)");
			testUser.setLive(false);
			
			System.out.println("testUserId="+testUser.getId());
			
			testUser.setAccountFunds(accountFunds);
			
			AutoTradingOptions testAutoTradingOptions = new AutoTradingOptions();
			testAutoTradingOptions.setBuyCeiling(1.0);
			testAutoTradingOptions.setSellFloor(1.0);
			TradingSession testTradingSession = new TradingSession();
			//testTradingSession.setUser(testUser);
			testTradingSession.setCurrencyLeft("usd");
			testTradingSession.setCurrencyRight("ltc");
			testTradingSession.setService("test");
			testTradingSession.setLive(false);
			testTradingSession.setAutoTradingOptions(testAutoTradingOptions);
			Rate testRate = new Rate();
			testRate.setBuy(1.0);
			testRate.setSell(1.0);
			testRate.setLast(1.0);
			testRate.setTime(System.currentTimeMillis() / 1000L);
			testRate.setPair("ltc_usd");
			testTradingSession.setRate(rate);

			String token = "" + Math.random();

			user.setAuthToken(token);
			testUser.setAuthToken(token);
			
			mongoOps.save(accountFunds);
			
			userRepository.save(user);
			tradingSessionRepository.save(tradingSession);
			user.addTradingSession(tradingSession);
			user.setCurrentTradingSession(tradingSession);
			userRepository.save(user);
			
			userRepository.save(testUser);
			tradingSessionRepository.save(testTradingSession);
			testUser.addTradingSession(testTradingSession);
			testUser.setCurrentTradingSession(testTradingSession);
			userRepository.save(testUser);
			
			response.setSuccess(3);

		}

		response.setData(user);

		return response;

	}

	private void createAddress(String currency, AccountFunds accountFunds) {
		
		String ip = null;
		int port = 0;
		
		if(currency.equals("btc")) {
			ip = "82.196.8.147";
			port = 9332;
		} else if(currency.equals("ltc")) {
			ip = "82.196.14.26";
			port = 8332;
		}
		
		if(port == 0) {
			return;
		}
		
		String accountName = accountFunds.getAccountName();
		if (accountName == null) {
			accountName = randomString();
			accountFunds.setAccountName(accountName);
		}

		Map<String, String> addresses = accountFunds.getAddresses();
		if (addresses == null) {
			addresses = new HashMap<String, String>();
		}
		
		BitcoinApi api = new BitcoinApi(ip, port,  "fluxltc1", "fLuxThuyu1eP");
		
		List<Object> params = new ArrayList<Object>();
		params.add(accountName);
		
		try {

			JSONObject addrResult = api.exec("getnewaddress", params);
			String addrStr = addrResult.getString("result");
			System.out.println("New address/account: " + addrStr + "/"
					+ accountName);

			addresses.put(currency, addrStr);

		} catch (Exception e) {
			e.printStackTrace();
		}
		
		accountFunds.setAddresses(addresses);

	}

	private String randomString() {

		String[] chars = new String[] { "A", "B", "C", "D", "E", "F", "G", "H",
				"I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U",
				"V", "X", "Z" };

		String str = "";

		for (int i = 0; i < 5; i++) {
			int charIndex = (int) Math.round(Math.random() * 22);
			str += chars[charIndex];
		}

		str += System.currentTimeMillis();

		return str;

	}
	
	
	@GET
	@Path("/deleteall")
	@Produces({ MediaType.TEXT_PLAIN })
	public String deleteAll() {

		// tickerRepository.deleteAll();
		mongoTemplate.dropCollection(Settings.class);
		mongoTemplate.dropCollection(FundTransaction.class);
		tradingSessionRepository.deleteAll();
		tradeRepository.deleteAll();
		orderRepository.deleteAll();
		userRepository.deleteAll();
		
		return "OK";

	}
	
	
	@GET
	@Path("/test")
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse test(@QueryParam("fromId") String tradingSessionId) {

		RequestResponse response = new RequestResponse();

		String accountName = randomString();
		
		BitcoinApi api = new BitcoinApi("127.0.0.1", 8332,  "fluxltc1", "fLuxThuyu1eP");
		
		List<Object> params = new ArrayList<Object>();
		params.add(accountName);
		
		JSONObject result = api.exec("getnewaddress", params);
		
		try {
			System.out.println(result.get("result"));
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		response.setData(result.toString());
		
		return response;

	}
	
	
	/*
	@GET
	@Path("/info")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public RequestResponse getAccountInfo(@HeaderParam("User-Id") String userId) {

		RequestResponse response = new RequestResponse();
		User user = userRepository.findByUsername(userId);

		JSONObject accountInfoResult = BtceApi.getAccountInfo();

		if (accountInfoResult == null) {
			response.setSuccess(0);
			response.setMessage("Could not get account info.");
			return response;
		}

		try {

			Integer success = accountInfoResult.getInt("success");
			response.setSuccess(success);

			if (success == 1) {

				JSONObject funds = accountInfoResult.getJSONObject("return")
						.getJSONObject("funds");

			}

		} catch (JSONException e) {

			e.printStackTrace();

			response.setSuccess(-1);
			response.setMessage(e.getMessage());

		}
		
		response.setData(user);

		return response;

	}
	*/

}
