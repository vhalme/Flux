package com.lenin.project.domain;

import java.io.Serializable;

public class AutoTradingOptions implements Serializable {

	
	private static final long serialVersionUID = 4044855246441420579L;

	private Boolean tradeAuto = false;
	
	private String autoTradingModel = "accumulateUsd";
	
	private Double sellThreshold = 0.05;
	private Double buyThreshold = 0.05;
	private Double rateBuffer = 0.0;
	private Double tradeChunk = 10.0;
	private Double sellFloor = 1.0;
	private Double buyCeiling = 1.0;
	
	public AutoTradingOptions() {
		
	}

	
	public Boolean getTradeAuto() {
		return tradeAuto;
	}


	public void setTradeAuto(Boolean tradeAuto) {
		this.tradeAuto = tradeAuto;
	}


	public String getAutoTradingModel() {
		return autoTradingModel;
	}

	public void setAutoTradingModel(String autoTradingModel) {
		this.autoTradingModel = autoTradingModel;
	}
	
	public Double getSellThreshold() {
		return sellThreshold;
	}


	public void setSellThreshold(Double sellThreshold) {
		this.sellThreshold = sellThreshold;
	}


	public Double getBuyThreshold() {
		return buyThreshold;
	}


	public void setBuyThreshold(Double buyThreshold) {
		this.buyThreshold = buyThreshold;
	}


	public Double getRateBuffer() {
		return rateBuffer;
	}

	public void setRateBuffer(Double rateBuffer) {
		this.rateBuffer = rateBuffer;
	}

	public Double getTradeChunk() {
		return tradeChunk;
	}

	public void setTradeChunk(Double tradeChunk) {
		this.tradeChunk = tradeChunk;
	}

	public Double getSellFloor() {
		return sellFloor;
	}

	public void setSellFloor(Double sellFloor) {
		this.sellFloor = sellFloor;
	}

	public Double getBuyCeiling() {
		return buyCeiling;
	}

	public void setBuyCeiling(Double buyCeiling) {
		this.buyCeiling = buyCeiling;
	}
	
	
	
	
	
}
