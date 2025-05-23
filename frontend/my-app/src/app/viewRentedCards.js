'use client';
import { useState, useEffect } from 'react';

const ViewRentedCards = ({ contract, account }) => {
    const [rentedCards, setRentedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRentedCards = async () => {
        setIsLoading(true);
        try {
            const [cardIds, cards, remainingTimes] = await contract.getRentedCards();
            console.log('Rented cards:', cardIds, cards, remainingTimes);
            
            const tokenURIPromises = cardIds.map(id => contract.tokenURI(id));
            const tokenURIs = await Promise.all(tokenURIPromises);
            
            const metadataPromises = tokenURIs.map(async uri => {
                try {
                    const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    const response = await fetch(httpUrl);
                    if (!response.ok) {
                        console.warn(`Failed to fetch metadata from ${httpUrl}`);
                        return { image: null };
                    }
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.warn(`Invalid content type from ${httpUrl}: ${contentType}`);
                        return { image: null };
                    }
                    return await response.json();
                } catch (error) {
                    console.warn('Error fetching metadata:', error);
                    return { image: null };
                }
            });
            
            const metadata = await Promise.all(metadataPromises);
            
            const rentedCardsData = cards.map((card, index) => ({
                id: cardIds[index],
                name: card.name,
                title: card.title,
                company: card.company,
                contactInfo: card.contactInfo,
                remainingTime: remainingTimes[index],
                image: metadata[index]?.image ? metadata[index].image.replace('ipfs://', 'https://ipfs.io/ipfs/') : null
            }));

            setRentedCards(rentedCardsData);
        } catch (err) {
            setError('Failed to fetch rented cards: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contract && account) {
            fetchRentedCards();
        }
    }, [contract, account]);

    const formatTimeRemaining = (seconds) => {
        // Convert BigInt to Number
        const secondsNum = Number(seconds);
        const days = Math.floor(secondsNum / (24 * 60 * 60));
        const hours = Math.floor((secondsNum % (24 * 60 * 60)) / (60 * 60));
        return `${days}d ${hours}h`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Rented Cards</h2>
                
                {rentedCards.length === 0 ? (
                    <div className="text-gray-600 text-center py-8">
                        You haven't rented any cards yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rentedCards.map((card) => (
                            <div key={card.id.toString()} 
                                 className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">{card.name}</h3>
                                        <p className="text-gray-600">{card.title}</p>
                                    </div>
                                    {card.image && (
                                        <img 
                                            src={card.image} 
                                            alt="Business Card" 
                                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                                        />
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-gray-700"><span className="font-semibold">Company:</span> {card.company}</p>
                                    <p className="text-gray-700"><span className="font-semibold">Contact:</span> {card.contactInfo}</p>
                                    <p className="text-gray-700"><span className="font-semibold">Card ID:</span> {card.id.toString()}</p>
                                    <p className="text-blue-600 font-semibold">
                                        Time Remaining: {formatTimeRemaining(card.remainingTime)}
                                    </p>
                                </div>

                                <a 
                                    href={`https://testnets.opensea.io/assets/sepolia/${contract.target}/${card.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-block w-full text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                             transition duration-200 ease-in-out transform hover:scale-105"
                                >
                                    View on OpenSea
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewRentedCards;