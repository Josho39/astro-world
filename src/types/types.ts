import { ReactNode } from "react";

export enum TxType {
  SIGN_TX,
  SEND_KASPA,
  SIGN_KRC20_DEPLOY,
  SIGN_KRC20_MINT,
  SIGN_KRC20_TRANSFER
}

export interface TokenData {
  ticker: string;
  logoUrl?: string;
  price?: number;
  change24h?: number;
  volumeUsd?: number;
  marketCap?: number;
  totalHolders?: number;
  creationDate?: string;
}

export interface ArbOpportunity {
  token: string;
  percentage: number;
  fromExchange: string;
  toExchange: string;
}

export interface NFTMint {
  tick: string;
  id: number;
  timestamp: string;
  thumbnail_url?: string;
  current_mint_position?: number;
  total_supply?: number;
}

export interface PortfolioItem {
  name: string;
  value: number;
  percentage: number;
  price: number;
  change24h: number;
}

export interface Transaction {
  type: string;
  timestamp: string | number | Date;
  amount: ReactNode;
  transaction_id?: string;
  txid?: string;
  block_time?: number;
  outputs?: Array<{
    address: string;
    amount: number;
  }>;
}

export interface BatchTransferRes {
  results: any;
  instanceId: any;
  index?: number;
  tick?: string;
  to?: string;
  amount?: number;
  status:
    | 'success'
    | 'failed'
    | 'preparing 20%'
    | 'preparing 40%'
    | 'preparing 60%'
    | 'preparing 80%'
    | 'preparing 100%';
  errorMsg?: string;
  txId?: { commitId: string; revealId: string };
}

export interface TransferInstance {
  id: string;
  address: string;
  publicKey: string;
  balance: {
    confirmed: number;
    unconfirmed: number;
    total: number;
  };
  network: string;
  batchTransferProgress?: BatchTransferRes;
  transferRange?: string;
}

export interface MarketData {
  priceInUsd: number;
  volumeInUsd: number;
}

export interface MarketInfo {
  name: string;
  marketData?: MarketData;
}

export interface Token {
  ticker: string;
  marketsData?: MarketInfo[];
}

export interface MarketPrice {
  market: string;
  price: number;
  volume: number;
}

export interface CombinedMarketData {
  ticker: string;
  markets: MarketPrice[];
  maxPrice: number;
  minPrice: number;
  maxSpread: number;
}

export interface DetailedArbOpportunity {
  ticker: string;
  market1: {
    name: string;
    price: number;
    volume: number;
    action: 'BUY' | 'SELL';
  };
  market2: {
    name: string;
    price: number;
    volume: number;
    action: 'BUY' | 'SELL';
  };
  arbPercentage: number;
  profitPerToken: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}