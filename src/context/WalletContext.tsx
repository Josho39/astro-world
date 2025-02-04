'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WalletInfo {
    address: string;
    balance: number;
    network: string;
    refreshBalance: () => Promise<void>;
}

interface WalletContextType {
    walletConnected: boolean;
    walletInfo: WalletInfo | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isTestnet: boolean;
    switchToTestnet: () => Promise<void>;
    switchToMainnet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);
const WALLET_CONNECTION_KEY = 'wallet_connected';
const TESTNET_PREFIX = 'kaspatest:';
const TESTNET_NETWORK = 'kaspa_testnet_10';
const MAINNET_NETWORK = 'kaspa_mainnet';
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 3;
const ALLOWED_TESTNET_ADDRESS = 'kaspatest:qpnq3pt49cqn7xmuwjlxv7cx6yymuqfva3z9sz2mu7jska9t3zg5gsxdht9y0';

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
    const [isTestnet, setIsTestnet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const isTestnetAddress = (address: string): boolean => {
        return address.toLowerCase().startsWith(TESTNET_PREFIX);
    };

    const checkNetwork = useCallback(async () => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
            try {
                const kasware = (window as any).kasware;
                const network = await kasware.getNetwork();
                const isOnTestnet = network === TESTNET_NETWORK;
                setIsTestnet(isOnTestnet);
                return network;
            } catch (error) {
                console.error('Error checking network:', error);
                return null;
            }
        }
    }, []);

    useEffect(() => {
        const initializeWallet = async () => {
          const wasConnected = localStorage.getItem(WALLET_CONNECTION_KEY) === 'true';
          
          if (wasConnected && typeof window !== 'undefined' && (window as any).kasware) {
            try {
              const kasware = (window as any).kasware;
              const accounts = await kasware.getAccounts();
              
              if (accounts.length > 0) {
                setWalletConnected(true);
                const network = await kasware.getNetwork();
                const balance = await kasware.getBalance();
                
                setWalletInfo({
                  address: accounts[0],
                  balance: parseFloat((balance.total / 100000000).toFixed(1)),
                  network: network,
                  refreshBalance
                });
                
                setIsTestnet(network === TESTNET_NETWORK);
              }
            } catch (error) {
              console.error('Error reconnecting wallet:', error);
              localStorage.removeItem(WALLET_CONNECTION_KEY);
            }
          }
        };
      
        initializeWallet();
      }, []);

    const refreshBalance = useCallback(async (retries = 0, delay = 0) => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            try {
                const kasware = (window as any).kasware;
                const network = await checkNetwork();
                if (!network) {
                    throw new Error('Network check failed');
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                const newBalance = await kasware.getBalance();

                setWalletInfo(prevInfo => prevInfo ? {
                    ...prevInfo,
                    balance: parseFloat((newBalance.total / 100000000).toFixed(1)),
                    network: network
                } : null);

                setRetryCount(0);
            } catch (error: any) {
                console.error('Error refreshing balance:', error);

                const isWebSocketError = error.message?.includes('WebSocket');
                const retryDelay = isWebSocketError ?
                    Math.min(RETRY_INTERVAL * Math.pow(2, retries), 10000) :
                    RETRY_INTERVAL;

                if (retries < MAX_RETRIES) {
                    console.log(`Retrying balance refresh in ${retryDelay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                    setTimeout(() => refreshBalance(retries + 1, 1000), retryDelay);
                    setRetryCount(retries + 1);
                }
            }
        }
    }, [checkNetwork]);

    const switchToTestnet = async () => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
            try {
                const kasware = (window as any).kasware;
                const network = await kasware.switchNetwork(TESTNET_NETWORK);

                await new Promise(resolve => setTimeout(resolve, 1000));

                if (network === TESTNET_NETWORK) {
                    setIsTestnet(true);
                    await refreshBalance();
                } else {
                    throw new Error('Failed to switch to testnet');
                }
            } catch (error) {
                console.error('Error switching network:', error);
                throw error;
            }
        }
    };

    const switchToMainnet = async () => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
            try {
                const kasware = (window as any).kasware;
                const network = await kasware.switchNetwork(MAINNET_NETWORK);

                await new Promise(resolve => setTimeout(resolve, 1000));

                if (network === MAINNET_NETWORK) {
                    setIsTestnet(false);
                    await refreshBalance();
                } else {
                    throw new Error('Failed to switch to mainnet');
                }
            } catch (error) {
                console.error('Error switching to mainnet:', error);
                throw error;
            }
        }
    };

    useEffect(() => {
        const checkAndSwitchToMainnet = async () => {
            if (walletConnected && walletInfo?.address) {
                const currentAddress = walletInfo.address.toLowerCase();
                if (!currentAddress.startsWith('kaspa:') && 
                    currentAddress !== ALLOWED_TESTNET_ADDRESS.toLowerCase()) {
                    try {
                        await switchToMainnet();
                    } catch (error) {
                        console.error('Failed to auto-switch to mainnet:', error);
                    }
                }
            }
        };

        checkAndSwitchToMainnet();
    }, [walletConnected, walletInfo?.address]);

    const connectWallet = async () => {
        if (typeof window !== 'undefined') {
          try {
            const kasware = (window as any).kasware;
            if (!kasware) {
              alert('Kasware wallet not detected. Please install it first.');
              return;
            }
      
            const accounts = await kasware.requestAccounts();
            if (accounts.length > 0) {
              setWalletConnected(true);
              localStorage.setItem(WALLET_CONNECTION_KEY, 'true');
      
              try {
                const network = await kasware.getNetwork();
                const balance = await kasware.getBalance();
                setIsTestnet(network === TESTNET_NETWORK);
      
                setWalletInfo({
                  address: accounts[0],
                  balance: parseFloat((balance.total / 100000000).toFixed(1)),
                  network: network,
                  refreshBalance
                });
              } catch (error) {
                console.error('Error getting initial wallet info:', error);
                setWalletInfo({
                  address: accounts[0],
                  balance: 0,
                  network: 'unknown',
                  refreshBalance
                });
              }
            }
          } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
          }
        }
      };      

      const disconnectWallet = useCallback(async () => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
          try {
            const kasware = (window as any).kasware;
            await kasware.disconnect(window.location.origin);
          } catch (error) {
            console.error('Error disconnecting wallet:', error);
          }
        }
        setWalletConnected(false);
        setWalletInfo(null);
        setIsTestnet(false);
        setRetryCount(0);
        localStorage.removeItem(WALLET_CONNECTION_KEY);
      }, []);

    useEffect(() => {
        if (walletConnected && walletInfo) {
            refreshBalance();
            const pollInterval = setInterval(() => {
                refreshBalance();
            }, RETRY_INTERVAL);
            return () => clearInterval(pollInterval);
        }
    }, [walletConnected, walletInfo, refreshBalance]);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).kasware) {
            const kasware = (window as any).kasware;

            const handleAccountsChanged = async (accounts: string[]) => {
                if (accounts.length > 0) {
                    try {
                        const network = await kasware.getNetwork();
                        const balance = await kasware.getBalance();

                        setIsTestnet(network === TESTNET_NETWORK);
                        setWalletInfo({
                            address: accounts[0],
                            balance: parseFloat((balance.total / 100000000).toFixed(1)),
                            network: network,
                            refreshBalance
                        });
                    } catch (error) {
                        console.error('Error updating wallet info:', error);
                    }
                } else {
                    disconnectWallet();
                }
            };

            const handleNetworkChanged = async (network: string) => {
                console.log('Network changed to:', network);
                setIsTestnet(network === TESTNET_NETWORK);
                if (walletConnected) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await refreshBalance(0, 1000);
                }
            };

            kasware.on('accountsChanged', handleAccountsChanged);
            kasware.on('networkChanged', handleNetworkChanged);

            return () => {
                kasware.removeListener('accountsChanged', handleAccountsChanged);
                kasware.removeListener('networkChanged', handleNetworkChanged);
            };
        }
    }, [refreshBalance, walletConnected, disconnectWallet]);

    return (
        <WalletContext.Provider value={{
            walletConnected,
            walletInfo,
            connectWallet,
            disconnectWallet,
            isTestnet,
            switchToTestnet,
            switchToMainnet 
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}