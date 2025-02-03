'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import businessCard from './BusinessCard.json';
import MyCard from './myCard';
import Navbar from './navbar';

const contractAddress = '0x7240876D66920F98e29B9B063df02Bd80fA10464';

const App = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState([]);
    const [walletConnected, setWalletConnected] = useState(false);


    const connectWalletandContract = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                console.log('Connected Account:', accounts[0]);
                setWalletConnected(true);
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const businessCardContract = new ethers.Contract(contractAddress, businessCard.abi, signer);
            setContract(businessCardContract);
        } catch (error) {
            // set error state
            setWalletConnected(false);
        }
    };

    useEffect(() => {
        walletConnected
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {walletConnected ? (
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
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Welcome to Business Card dApp
                    </h1>
                    <p className="text-gray-600 mb-8 text-center max-w-md">
                        Connect your wallet to mint and manage your digital business cards
                    </p>
                    <button 
                        onClick={connectWalletandContract}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
                                 transition duration-200 ease-in-out transform hover:scale-105 
                                 shadow-lg hover:shadow-xl"
                    >
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;