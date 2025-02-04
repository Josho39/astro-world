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