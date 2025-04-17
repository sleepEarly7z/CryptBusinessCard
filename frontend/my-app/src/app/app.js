'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from './navbar';
import Mint from './mint';
import MyCard from './myCard';
import ConnectWallet from './connectWallet';
import businessCard from './BusinessCard.json';
import Send from './send';
import View from './view';
import UpdateCard from './updateCard';
import RentCard from './rentCard';
import ViewRentedCards from './viewRentedCards';
import ManageRental from './manageRental';
import Recommend from './recommend';
import recommendationABI from './CardRecommendation.json';


const contractAddress = '0x902eecD95DCd45deA6CCe9952BFE3858bC788845';
const recommendAddress = '0x2A160734b1B2676758F1B4cDe5A328A1aa57EB92';

// const recommendAddress = '0x09f8794F31aE0D162E0fd11814F696618F907A9E';
// const contractAddress = '0xD63BCbC1e600E70f8Eef1c181dDFEb70B9472dBF';

const App = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState([]);
    const [cardDetails, setCardDetails] = useState(null);
    const [cardId, setCardId] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [currentView, setCurrentView] = useState('home');
    const [cardImage, setCardImage] = useState(null);
    const [recommendContract, setRecommendContract] = useState(null);

    const checkWalletConnection = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setWalletConnected(true);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            return false;
        }
    };

    const setupCardSenderApproval = async (businessCardContract, recommendationAddress) => {
        try {
            const isApproved = await businessCardContract.approvedCardSenders(recommendationAddress);
            if (!isApproved) {
                console.log('Setting card sender approval...');
                const tx = await businessCardContract.setCardSender(recommendationAddress, true);
                await tx.wait();
                console.log('Card sender approval set successfully');
            } else {
                console.log('Card sender already approved');
            }
        } catch (error) {
            console.error('Error setting card sender approval:', error);
            alert('Error setting card sender approval. Please try again.');
        }
    };

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

            const recommendationContract = new ethers.Contract(
                recommendAddress,
                recommendationABI.abi,
                signer
            );
            setRecommendContract(recommendationContract);

            await setupCardSenderApproval(businessCardContract, recommendAddress);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setWalletConnected(false);
        }
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const fetchCardDetails = async () => {
        try {
            if (contract && account) {
                const userCardId = await contract.userCard(account);
                setCardId(userCardId);
                
                if (userCardId > 0) {
                    const details = await contract.getBusinessCard(userCardId);
                    setCardDetails({
                        name: details.name,
                        title: details.title,
                        company: details.company,
                        contactInfo: details.contactInfo
                    });

                    const tokenURI = await contract.tokenURI(userCardId);
                    if (tokenURI) {
                        const httpUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        const response = await fetch(httpUrl);
                        const metadata = await response.json();
                        const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        setCardImage(imageUrl);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching card details:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            const isConnected = await checkWalletConnection();
            if (isConnected) {
                connectWalletandContract();
            }
        };
        
        init();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setWalletConnected(true);
                    connectWalletandContract();
                } else {
                    setWalletConnected(false);
                    setAccount(null);
                    setContract(null);
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    useEffect(() => {
        if (contract && account) {
            fetchCardDetails();
        }
    }, [contract, account]);

    const renderContent = () => {
        if (!walletConnected) {
            return <ConnectWallet connectWallet={connectWalletandContract} />;
        }

        switch (currentView) {
            case 'mint':
                return <Mint contract={contract} account={account} />;
            case 'send':
                return <Send contract={contract} account={account} />;
            case 'view':
                return <View contract={contract} account={account} />;
            case 'update':
                return <UpdateCard contract={contract} account={account} />;
            case 'rent':
                return <RentCard contract={contract} account={account} />;
            case 'viewRented':
                return <ViewRentedCards contract={contract} account={account} />;
            case 'manageRental':
                return <ManageRental contract={contract} account={account} />;
            case 'recommend':
                return <Recommend 
                    contract={contract} 
                    account={account} 
                    recommendContract={recommendContract}
                />;
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
            
                            {cardDetails && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Business Card</h3>
                                    
                                    <div className="flex flex-row items-start space-x-4">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-gray-700"><span className="font-semibold">Name:</span> {cardDetails.name}</p>
                                            <p className="text-gray-700"><span className="font-semibold">Title:</span> {cardDetails.title}</p>
                                            <p className="text-gray-700"><span className="font-semibold">Company:</span> {cardDetails.company}</p>
                                            <p className="text-gray-700"><span className="font-semibold">Contact:</span> {cardDetails.contactInfo}</p>
                                            <p className="text-gray-700"><span className="font-semibold">Card ID:</span> {cardId.toString()}</p>
                                            
                                            <a 
                                                href={`https://testnets.opensea.io/assets/sepolia/${contractAddress}/${cardId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                                            >
                                                View on OpenSea
                                            </a>
                                        </div>
                                        
                                        {cardImage && (
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={cardImage} 
                                                    alt="Business Card" 
                                                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    
                            <div className="border-t border-gray-200 pt-6">
                                {/* <MyCard contract={contract} account={account} /> */}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onNavigate={handleNavigate} isWalletConnected={walletConnected} />
            <div className="pt-16">
            {renderContent()}
            </div>
        </div>
    );
};

export default App;