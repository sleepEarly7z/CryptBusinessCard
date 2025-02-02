'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import businessCard from './BusinessCard.json';
import MyCard from './myCard';

const contractAddress = '0x7240876D66920F98e29B9B063df02Bd80fA10464';

const App = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState([]);


    const connectContract = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const businessCardContract = new ethers.Contract(contractAddress, businessCard.abi, signer);
            setContract(businessCardContract);
        } catch (error) {
            console.error('Error connecting to contract:', error);
        }
    };

    useEffect(() => {
        connectContract();
    }, []);

    return (
        <div className="p-4">
            <h2>Ethereum Contract Connection</h2>
            {account && (
                <>
                    <p>Connected Account: {account}</p>
                    <MyCard contract={contract} />
                </>
            )}
        </div>
    );
};

export default App;