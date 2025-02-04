interface KaswareWallet {
    batchTransfer: (transfers: { to: string; amount: number }[]) => Promise<void>;
    getAccounts: () => Promise<string[]>;
    getBalance: () => Promise<{ total: number }>;
    getNetwork: () => Promise<string>;
    getPublicKey: () => Promise<string>;
    requestAccounts: () => Promise<string[]>;
    disconnect: (origin: string) => Promise<void>;
    switchNetwork: (network: string) => Promise<string>;
}

declare global {
    interface Window {
        kasware?: KaswareWallet;
    }
}