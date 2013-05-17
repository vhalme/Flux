package com.lenin.project.service;

import java.util.ArrayList;
import java.util.List;

import org.codehaus.jettison.json.JSONObject;

public class PaymentProcessor {
	
	public PaymentProcessor() {
		
	}
	
	public void checkPayment(String currency, String address) {
		
		
		BitcoinClient client = createBitcoinClient(currency);
		
		List<String> params = new ArrayList<String>();
		params.add(address);
		
		JSONObject result = client.exec("listreceivedbyaddress", params);
		
		try {
			
			System.out.println(result.get("result"));
		
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		
	}
	
	private BitcoinClient createBitcoinClient(String currency) {
		
		BitcoinClient client = null;
		
		if(currency.equals("ltc")) {
			client = new BitcoinClient("127.0.0.1", 8332, "fluxltc1", "fLuxThuyu1eP");
		}
		
		return client;
		
	}

}
