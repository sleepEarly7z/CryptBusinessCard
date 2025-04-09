'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Recommend = ({ contract, account, recommendContract }) => {
    const [recommendee, setRecommendee] = useState('');
    const [selectedCard, setSelectedCard] = useState('');
    const [receivedCards, setReceivedCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingRecommendations, setPendingRecommendations] = useState([]);
    const [tokenBalance, setTokenBalance] = useState('0');

    useEffect(() => {
        if (contract && account && recommendContract) {
            fetchReceivedCards();
            fetchPendingRecommendations();
            fetchTokenBalance();
        }
    }, [contract, account, recommendContract]);

    const fetchReceivedCards = async () => {
        try {
            const cards = await contract.getReceivedCards(account);
            setReceivedCards(cards);
            console.log('Received cards:', cards);
        } catch (error) {
            console.error('Error fetching received cards:', error);
        }
    };

    const fetchTokenBalance = async () => {
        try {
            const balance = await recommendContract.balanceOf(account);
            setTokenBalance(ethers.formatEther(balance));
        } catch (error) {
            console.error('Error fetching token balance:', error);
        }
    };

    const fetchPendingRecommendations = async () => {
        try {
            const filter = recommendContract.filters.RecommendationCreated(null, account);
            const events = await recommendContract.queryFilter(filter);
            const pending = [];

            for (let event of events) {
                const recommender = event.args.recommender;
                const cardId = event.args.cardId;
                const pendingCardId = await recommendContract.pendingRecommendations(account, recommender);
                if (pendingCardId > 0) {
                    pending.push({ recommender, cardId: pendingCardId });
                }
            }
            setPendingRecommendations(pending);
        } catch (error) {
            console.error('Error fetching pending recommendations:', error);
        }
    };

    const recommendCard = async () => {
        try {
            setLoading(true);
            const tx = await recommendContract.recommendCard(recommendee, selectedCard);
            await tx.wait();
            alert('Recommendation sent successfully!');
            setRecommendee('');
            setSelectedCard('');
            fetchReceivedCards();
        } catch (error) {
            console.error('Error recommending card:', error);
            alert('Error recommending card: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const acceptRecommendation = async (recommender) => {
        try {
            setLoading(true);
            const tx = await recommendContract.acceptRecommendation(recommender);
            await tx.wait();
            alert('Recommendation accepted successfully!');
            fetchPendingRecommendations();
            fetchTokenBalance();
        } catch (error) {
            console.error('Error accepting recommendation:', error);
            alert('Error accepting recommendation: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Recommendations</h1>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Your REC Balance</p>
                    <p className="text-2xl font-bold text-blue-600">{tokenBalance} REC</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Recommend a Card</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recommendee Address:</label>
                        <input
                            type="text"
                            value={recommendee}
                            onChange={(e) => setRecommendee(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="0x..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Card:</label>
                        <select
                            value={selectedCard}
                            onChange={(e) => setSelectedCard(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select a card</option>
                            {receivedCards.map((cardId) => (
                                <option key={cardId.toString()} value={cardId.toString()}>
                                    Card #{cardId.toString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={recommendCard}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Processing...' : 'Recommend Card'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Pending Recommendations</h2>
                {pendingRecommendations.length === 0 ? (
                    <p className="text-gray-500">No pending recommendations</p>
                ) : (
                    <div className="space-y-4">
                        {pendingRecommendations.map((rec, index) => (
                            <div key={index} className="border p-4 rounded-md">
                                <p className="mb-2">From: {rec.recommender}</p>
                                <p className="mb-4">Card ID: {rec.cardId.toString()}</p>
                                <button
                                    onClick={() => acceptRecommendation(rec.recommender)}
                                    disabled={loading}
                                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {loading ? 'Processing...' : 'Accept Recommendation'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommend;