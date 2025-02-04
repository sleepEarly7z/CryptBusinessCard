'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from './navbar';
import Mint from './mint';
import MyCard from './myCard';
import ConnectWallet from './connectWallet';
import businessCard from './BusinessCard.json';

const contractAddress = '0x7240876D66920F98e29B9B063df02Bd80fA10464';

const App = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState([]);
    const [walletConnected, setWalletConnected] = useState(false);
    const [currentView, setCurrentView] = useState('home');

    const connectWalletandContract = async () => {
        try {
            if (!window.ethereum) {
                alert('Please install MetaMask!');
                return;
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            setAccount(accounts[0]);
            setWalletConnected(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const businessCardContract = new ethers.Contract(
                contractAddress, 
                businessCard.abi, 
                signer
            );
            setContract(businessCardContract);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setWalletConnected(false);
        }
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    useEffect(() => {
        if (walletConnected) {
            connectWalletandContract();
        }
    }, [walletConnected]);

    const renderContent = () => {
        if (!walletConnected) {
            return <ConnectWallet connectWallet={connectWalletandContract} />;
        }

        switch (currentView) {
            case 'mint':
                return <Mint contract={contract} account={account} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen p-4">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto transition-all duration-300 hover:shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                Ethereum Wallet Connected
                            </h2>
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-2">Connected Account:</p>
                                <p className="font-mono text-gray-800 break-all">
                                    {account}
                                </p>
                            </div>
                    
                            <div className="border-t border-gray-200 pt-6">
                                <MyCard contract={contract} account={account} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onNavigate={handleNavigate} />
            {renderContent()}
        </div>
    );
};

export default App;