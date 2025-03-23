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
            
            // Fetch token URIs and metadata for images
            const tokenURIPromises = cardIds.map(id => contract.tokenURI(id));
            const tokenURIs = await Promise.all(tokenURIPromises);
            
            // Fetch metadata and images
            const metadataPromises = tokenURIs.map(async uri => {
                const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                const response = await fetch(httpUrl);
                return response.json();
            });
            
            const metadata = await Promise.all(metadataPromises);
            
            // Combine all data
            const rentedCardsData = cards.map((card, index) => ({
                id: cardIds[index],
                name: card.name,
                title: card.title,
                company: card.company,
                contactInfo: card.contactInfo,
                remainingTime: remainingTimes[index],
                image: metadata[index].image.replace('ipfs://', 'https://ipfs.io/ipfs/')
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
        // Convert BigInt to Number for calculations
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
            <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-2xl mx-auto mt-8">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Rented Cards</h2>
            
            {rentedCards.length === 0 ? (
                <div className="text-gray-600 text-center py-8">
                    You haven't rented any cards yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rentedCards.map((card) => (
                        <div key={card.id.toString()} 
                             className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
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
                                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                            >
                                View on OpenSea
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewRentedCards;