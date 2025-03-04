import { NextResponse } from 'next/server';

async function fetchTransactionBatch(address: string, offset: number) {
  const limit = 50;
  const apiUrl = `https://api.kaspa.org/addresses/${address}/full-transactions?limit=${limit}&offset=${offset}&resolve_previous_outpoints=full`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format from Kaspa API');
  }

  return data;
}

async function fetchAllTransactions(address: string) {
  const INITIAL_BATCH_SIZE = 10;
  let allTransactions: any[] = [];

  try {
    const initialBatches = await Promise.all(
      Array.from({ length: INITIAL_BATCH_SIZE }, (_, i) => 
        fetchTransactionBatch(address, i * 50)
      )
    );

    for (const batch of initialBatches) {
      allTransactions = [...allTransactions, ...batch];
      if (batch.length < 50) {
        return allTransactions;
      }
    }

    let offset = INITIAL_BATCH_SIZE * 50;
    let hasMore = true;

    while (hasMore) {
      const batch = await fetchTransactionBatch(address, offset);
      if (batch.length === 0) {
        hasMore = false;
      } else {
        allTransactions = [...allTransactions, ...batch];
        offset += 50;
      }
    }

    return allTransactions;
  } catch (error) {
    throw new Error(`Failed to fetch transactions: ${(error as Error).message}`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' }, 
      { status: 400 }
    );
  }

  try {
    const allTransactions = await fetchAllTransactions(address);
    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Kaspa API', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}