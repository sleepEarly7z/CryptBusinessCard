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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Recommendations</h1>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Your REC Balance</p>
                        <p className="text-2xl font-bold text-blue-600">{tokenBalance} REC</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Recommend a Card</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Recommendee Address:
                            </label>
                            <input
                                type="text"
                                value={recommendee}
                                onChange={(e) => setRecommendee(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="0x..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Select Card:
                            </label>
                            <select
                                value={selectedCard}
                                onChange={(e) => setSelectedCard(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                     transition duration-200 ease-in-out transform hover:scale-105
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Recommend Card'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Pending Recommendations</h2>
                    {pendingRecommendations.length === 0 ? (
                        <p className="text-gray-500">No pending recommendations</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingRecommendations.map((rec, index) => (
                                <div key={index} className="border p-4 rounded-md shadow-sm">
                                    <p className="text-sm text-gray-600 mb-2">From: {rec.recommender}</p>
                                    <p className="text-sm text-gray-600 mb-4">Card ID: {rec.cardId.toString()}</p>
                                    <button
                                        onClick={() => acceptRecommendation(rec.recommender)}
                                        disabled={loading}
                                        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded
                                                 transition duration-200 ease-in-out transform hover:scale-105
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing...' : 'Accept Recommendation'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recommend;