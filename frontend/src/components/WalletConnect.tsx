import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, LogOut, ChevronDown, ExternalLink, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MetaMaskIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E2761B" stroke="#E2761B" strokeMiterlimit="10" d="M274.1 35.5l-99.5 73.9L194 65.4z"/>
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M44.4 35.5l98.7 74.6-18.4-44.7zM260.9 238.2l-28.5 44-71.3-21.4 79.5-35.3zM57.6 238.2l20.4-12.7 79.4 35.3-71.3 21.4z"/>
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeMiterlimit="10" d="M194 65.4l-19.4 44-38.8.1-19.4-44.1 27.6-32.9h22.4z"/>
    <path fill="#233447" stroke="#233447" strokeMiterlimit="10" d="M159.3 260.8l-79.4-35.3 12.8-10.4 56.6 23.3 10-10.5 10 10.5 56.6-23.3 12.8 10.4z"/>
    <path fill="#CD6116" stroke="#CD6116" strokeMiterlimit="10" d="M125.8 109.5l-44.4 22.8 15.7 34.6 48.1-57.4zM192.8 109.5l-19.4 57.4 48.1 57.4 15.7-34.6z"/>
    <path fill="#E4751F" stroke="#E4751F" strokeMiterlimit="10" d="M81.4 132.3l-37 17.6 24 38.6 3.8-3.4 18.2-18.2zM237.2 132.3l-9 34.6 18.2 18.2 3.8 3.4 24-38.6z"/>
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="M68.4 188.5l-19.5 47.9 31.8-7.9 2.5-3.8zM250.2 188.5l-14.8 36.2 2.5 3.8 31.8 7.9zM192.8 109.5l-33.5-3.3-33.5 3.3-19.4 44 26 25.4 26.9 10.2 26.9-10.2 26-25.4z"/>
    <path fill="#C0AD9E" stroke="#C0AD9E" strokeMiterlimit="10" d="M159.3 189l-26.9-10.2-26-25.4 19.4-44 33.5 44 33.5-44 19.4 44-26 25.4z"/>
    <path fill="#161616" stroke="#161616" strokeMiterlimit="10" d="M106.4 153.4l26.9 10.2-7 14.5-23.7-4.3zM212.2 153.4l3.8 20.4-23.7 4.3-7-14.5z"/>
    <path fill="#763D16" stroke="#763D16" strokeMiterlimit="10" d="M126.3 178.1l7 14.5-12.8 10.4-17.9-14.5zM192.3 178.1l23.7 10.4-17.9 14.5-12.8-10.4z"/>
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="M82.6 188.5l17.9 14.5-12.8 10.4-19.5-24.9zM236 188.5l14.4 0-19.5 24.9-12.8-10.4z"/>
  </svg>
);

export const WalletConnect: React.FC = () => {
  const {
    address,
    balance,
    isConnected,
    isLoading,
    walletType,
    isMetaMaskInstalled,
    chainId,
    error,
    connectMetaMask,
    connectDevWallet,
    disconnectWallet,
    refreshBalance
  } = useWallet();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    if (!id) return "Localhost / Testnet";
    switch (id) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 31337: return "Hardhat Local";
      default: return `Chain ${id}`;
    }
  };

  // Connected state
  if (isConnected && address) {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-300 dark:border-gray-600 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          {walletType === 'metamask' ? (
            <MetaMaskIcon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              DEV
            </div>
          )}

          <div className="flex flex-col text-left leading-none">
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
              {formatAddress(address)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {balance.toFixed(3)} ETH
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {walletType === 'metamask' ? (
                  <>
                    <MetaMaskIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">MetaMask Connected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Local Dev Wallet</span>
                  </>
                )}
              </div>
              <button
                onClick={() => refreshBalance()}
                title="Refresh balance"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-2.5 mb-3 text-xs space-y-1">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Network:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{getNetworkName(chainId)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Balance:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{balance.toFixed(4)} ETH</span>
              </div>
              <div className="pt-1 text-[11px] font-mono text-gray-600 dark:text-gray-300 break-all select-all">
                {address}
              </div>
            </div>

            <div className="space-y-1">
              {walletType !== 'metamask' && isMetaMaskInstalled && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    connectMetaMask();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg font-medium transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <MetaMaskIcon className="w-4 h-4" />
                    <span>Switch to MetaMask</span>
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={() => {
                  disconnectWallet();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state: Connect Wallet Button & Modal
  return (
    <>
      <button
        onClick={() => setShowConnectModal(true)}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        <MetaMaskIcon className="w-5 h-5" />
        <span>{isLoading ? 'Connecting...' : 'Connect MetaMask'}</span>
      </button>

      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-orange-500" />
                <span>Connect Wallet</span>
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Connect your Web3 wallet to post jobs, deposit escrow funds, or receive payments on the marketplace.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2 text-xs text-red-600 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* MetaMask Option */}
              <button
                onClick={async () => {
                  const success = await connectMetaMask();
                  if (success) setShowConnectModal(false);
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/50 hover:border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-900/40 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <MetaMaskIcon className="w-7 h-7" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">MetaMask</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isMetaMaskInstalled ? "Installed & Ready" : "Click to detect or install"}
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded font-medium">
                  Popular
                </span>
              </button>

              {/* Dev / Simulated Local Account */}
              <button
                onClick={() => {
                  connectDevWallet();
                  setShowConnectModal(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-gray-50 dark:bg-gray-900/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    DEV
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Local Dev Wallet</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Instant test wallet with 10.0 ETH</div>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-medium">
                  Instant
                </span>
              </button>
            </div>

            {!isMetaMaskInstalled && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  <span>Don't have MetaMask? Download it here</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;
