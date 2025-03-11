'use client';
import { useState, useEffect } from 'react';

const View = ({ contract, account }) => {
    const [receivedCards, setReceivedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReceivedCards = async () => {
        setIsLoading(true);
        try {
            const receivedCardIds = Array.from(await contract.getReceivedCards(account));
            console.log('Received card IDs:', receivedCardIds);
            
            if (receivedCardIds.length > 0) {
                const cardDetails = await contract.getMultipleBusinessCards(receivedCardIds);
                const ownerPromises = receivedCardIds.map(id => contract.ownerOf(id));
                const tokenURIPromises = receivedCardIds.map(id => contract.tokenURI(id));
                
                const [owners, tokenURIs] = await Promise.all([
                    Promise.all(ownerPromises),
                    Promise.all(tokenURIPromises)
                ]);

                // Fetch metadata and images for all cards
                const metadataPromises = tokenURIs.map(async uri => {
                    try {
                        const httpUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        const response = await fetch(httpUrl);
                        const metadata = await response.json();
                        return metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    } catch (error) {
                        console.error('Error fetching metadata:', error);
                        return null;
                    }
                });

                const images = await Promise.all(metadataPromises);
                
                const cards = receivedCardIds.map((id, index) => ({
                    id: id.toString(),
                    owner: owners[index],
                    image: images[index],
                    details: {
                        name: cardDetails[index].name,
                        title: cardDetails[index].title,
                        company: cardDetails[index].company,
                        contactInfo: cardDetails[index].contactInfo
                    }
                }));
                
                setReceivedCards(cards);
            } else {
                setReceivedCards([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching received cards:', error);
            setError('Failed to load received cards');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contract && account) {
            fetchReceivedCards();
        }
    }, [contract, account]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Received Business Cards</h2>
            
            {receivedCards.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No business cards received yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {receivedCards.map((card) => (
                        <div key={card.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex flex-row items-start space-x-4">
                                {/* Card Details */}
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold text-gray-800">{card.details.name}</h3>
                                        <p className="text-gray-500">{card.details.title}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-gray-700">
                                            <span className="font-medium">Company:</span> {card.details.company}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Contact:</span> {card.details.contactInfo}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Card ID:</span> {card.id}
                                        </p>
                                        <p className="text-sm text-gray-500 break-all">
                                            <span className="font-medium">Owner:</span> {card.owner}
                                        </p>
                                    </div>
                                </div>

                                {card.image && (
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={card.image} 
                                            alt="Business Card" 
                                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default View;