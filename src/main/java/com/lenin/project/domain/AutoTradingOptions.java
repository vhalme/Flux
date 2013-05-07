package com.lenin.project.domain;

import java.io.Serializable;

public class AutoTradingOptions implements Serializable {

	
	private static final long serialVersionUID = 4044855246441420579L;

	
	private String autoTradingModel = "accumulateUsd";
	
	private Double profitTarget = 0.05;
	private Double rateBuffer = 0.001;
	private Double tradeChunk = 10.0;
	private Double sellFloor = 1.0;
	private Double buyCeiling = 1.0;
	
	public AutoTradingOptions() {
		
	}

	public String getAutoTradingModel() {
		return autoTradingModel;
	}

	public void setAutoTradingModel(String autoTradingModel) {
		this.autoTradingModel = autoTradingModel;
	}

	public Double getProfitTarget() {
		return profitTarget;
	}

	public void setProfitTarget(Double profitTarget) {
		this.profitTarget = profitTarget;
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
