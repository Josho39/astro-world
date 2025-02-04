export enum TxType {
    SIGN_TX,
    SEND_KASPA,
    SIGN_KRC20_DEPLOY,
    SIGN_KRC20_MINT,
    SIGN_KRC20_TRANSFER
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

export interface ArbOpportunity {
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