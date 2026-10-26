import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletContextType {
  account: { address: string } | null;
  address: string | null;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  walletType: 'metamask' | 'dev' | null;
  isMetaMaskInstalled: boolean;
  chainId: number | null;
  connectMetaMask: () => Promise<boolean>;
  connectDevWallet: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createAccount: () => Promise<void>;
  importAccount: (privateKey: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'metamask' | 'dev' | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  // Check if MetaMask is available
  useEffect(() => {
    const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask || window.ethereum);
    setIsMetaMaskInstalled(hasMetaMask);

    // Auto-restore previous connection
    const savedType = localStorage.getItem('wallet_type') as 'metamask' | 'dev' | null;
    const savedAddress = localStorage.getItem('wallet_address');

    if (savedType === 'metamask' && hasMetaMask) {
      restoreMetaMask();
    } else if (savedType === 'dev' && savedAddress) {
      setAddress(savedAddress);
      setBalance(10.0);
      setIsConnected(true);
      setWalletType('dev');
    } else {
      // Default initial mock connection so UI is immediately usable
      const defaultDevAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      setAddress(defaultDevAddr);
      setBalance(10.0);
      setIsConnected(true);
      setWalletType('dev');
    }
  }, []);

  // Listen to MetaMask account & network events
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('wallet_address', accounts[0]);
          refreshBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainHex: string) => {
        setChainId(parseInt(chainHex, 16));
        if (address) refreshBalance(address);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [address]);

  const restoreMetaMask = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const userAddr = accounts[0].address;
          setAddress(userAddr);
          setIsConnected(true);
          setWalletType('metamask');
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
          const balWei = await provider.getBalance(userAddr);
          setBalance(parseFloat(ethers.formatEther(balWei)));
        }
      }
    } catch (e) {
      console.warn("Could not silently reconnect MetaMask:", e);
    }
  };

  const connectMetaMask = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError("MetaMask extension is not detected. Please install MetaMask to continue.");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0];
        setAddress(userAddr);
        setIsConnected(true);
        setWalletType('metamask');
        localStorage.setItem('wallet_type', 'metamask');
        localStorage.setItem('wallet_address', userAddr);

        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));

        const balWei = await provider.getBalance(userAddr);
        setBalance(parseFloat(ethers.formatEther(balWei)));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("MetaMask connection failed:", err);
      if (err.code === 4001) {
        setError("Connection rejected in MetaMask.");
      } else {
        setError(err.message || "Failed to connect MetaMask.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectDevWallet = () => {
    const devAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    setAddress(devAddr);
    setBalance(10.0);
    setIsConnected(true);
    setWalletType('dev');
    setError(null);
    localStorage.setItem('wallet_type', 'dev');
    localStorage.setItem('wallet_address', devAddr);
  };

  const connectWallet = async () => {
    if (isMetaMaskInstalled) {
      const ok = await connectMetaMask();
      if (!ok) {
        connectDevWallet();
      }
    } else {
      connectDevWallet();
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(0);
    setIsConnected(false);
    setWalletType(null);
    setError(null);
    localStorage.removeItem('wallet_type');
    localStorage.removeItem('wallet_address');
  };

  const refreshBalance = async (targetAddress?: string) => {
    const addr = targetAddress || address;
    if (!addr) return;

    if (walletType === 'metamask' && typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balWei = await provider.getBalance(addr);
        setBalance(parseFloat(ethers.formatEther(balWei)));
      } catch (err) {
        console.error("Error refreshing MetaMask balance:", err);
      }
    } else {
      // Mock dev balance
      setBalance(10.0);
    }
  };

  const createAccount = async () => {
    const randomAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setAddress(randomAddr);
    setBalance(5.0);
    setIsConnected(true);
    setWalletType('dev');
    localStorage.setItem('wallet_type', 'dev');
    localStorage.setItem('wallet_address', randomAddr);
  };

  const importAccount = async (privateKey: string) => {
    try {
      const wallet = new ethers.Wallet(privateKey);
      setAddress(wallet.address);
      setBalance(10.0);
      setIsConnected(true);
      setWalletType('dev');
      localStorage.setItem('wallet_type', 'dev');
      localStorage.setItem('wallet_address', wallet.address);
    } catch {
      const derived = '0x' + (privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey).padEnd(40, '0').slice(0, 40);
      setAddress(derived);
      setBalance(10.0);
      setIsConnected(true);
      setWalletType('dev');
    }
  };

  const account = address ? { address } : null;

  return (
    <WalletContext.Provider
      value={{
        account,
        address,
        balance,
        isConnected,
        isLoading,
        error,
        walletType,
        isMetaMaskInstalled,
        chainId,
        connectMetaMask,
        connectDevWallet,
        connectWallet,
        disconnectWallet,
        createAccount,
        importAccount,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
