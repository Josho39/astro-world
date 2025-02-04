const API_BASE = process.env.NEXT_PUBLIC_API_SERVER || 'https://api.kaspa.org';

interface Transaction {
  transaction_id: string;
  hash: string;
  block_time: number;
  is_accepted: boolean;
  accepting_block_hash?: string;
  accepting_block_blue_score?: number;
  subnetwork_id: string;
  mass: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

interface TransactionInput {
  previous_outpoint_hash: string;
  previous_outpoint_index: number;
  signature_script: string;
  sig_op_count: number;
}

interface TransactionOutput {
  amount: number;
  script_public_key: string;
  script_public_key_type: string;
  script_public_key_address: string;
  index: number;
}

interface AddressBalance {
  balance: number;
  receiving: number;
  spending: number;
}

export async function getTransaction(hash: string, blockHash?: string, p0?: boolean): Promise<Transaction> {
  const queryParams = blockHash ? `?blockHash=${blockHash}` : '';
  const response = await fetch(`${API_BASE}/transactions/${hash}${queryParams}`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }

  return response.json();
}

export async function getAddressBalance(addr: string): Promise<AddressBalance> {
  const response = await fetch(`${API_BASE}/addresses/${addr}/balance`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch address balance: ${response.statusText}`);
  }

  return response.json();
}

export async function getAddressTransactions(
  addr: string,
  limit = 20,
  offset = 0
): Promise<Transaction[]> {
  const response = await fetch(
    `${API_BASE}/addresses/${addr}/full-transactions?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      method: 'GET',
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch address transactions: ${response.statusText}`);
  }

  const transactions = await response.json();

  const fullTransactions = await Promise.all(
    transactions.map((tx: { transaction_id: string; }) => 
      getTransaction(tx.transaction_id, undefined, true)
    )
  );

  return fullTransactions;
}

export async function getMarketData(): Promise<any> {
  const response = await fetch(`${API_BASE}/info/market-data`, {
    headers: { 'Cache-Control': 'no-cache' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }

  return response.json();
}

export async function getNetworkInfo(): Promise<any> {
  const response = await fetch(`${API_BASE}/info/blockdag`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch network info');
  }

  return response.json();
}