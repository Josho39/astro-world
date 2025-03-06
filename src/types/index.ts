export interface NFTCollection {
  tick: string;
  floor_price: number;
  total_volume: number;
  volume_24h: number;
  change_24h: number;
  total_supply?: number;
  minted_count?: number;
  minted_percentage?: number;
  thumbnail_url?: string;
  deployer?: string;
  buri?: string;
  royaltyFee?: string;
  premint?: number;
  mtsAdd?: string; 
  opScoreMod?: string;
  state?: string;
  mtsMod?: string;
  opScoreAdd?: string;
  royaltyTo?: string;
  daaMintStart?: string;
  txIdRev?: string;
  first_seen?: string;
  last_updated?: string;
}

export interface NFTToken {
  id: number;
  image_url: string;
  metadata_url?: string;
  minted?: boolean;
}

export interface MintedData {
  minted: number[];
}

export interface CollectionsResponse {
  message: string;
  result: NFTCollection[];
  next?: string | number;
}

export interface ApiOptions {
  offset?: number;
  limit?: number;
}

export interface NewMintsCollection {
  _id: string;
  tick: string;
  minted_count: number;
  minted_ids: number[];
  total_supply: number;
  buri: string;
  state: string;
  deployer: string;
  first_seen: string;
  last_updated: string;
}