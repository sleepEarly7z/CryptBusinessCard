'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

const RentCard = ({ contract, account }) => {
    const [cardId, setCardId] = useState('');
    const [renterAddress, setRenterAddress] = useState('');
    const [duration, setDuration] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRent = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const durationInSeconds = parseInt(duration) * 24 * 60 * 60;
            
            const tx = await contract.rentBusinessCard(
                cardId,
                renterAddress,
                durationInSeconds
            );

            await tx.wait();
            
            setSuccess('Card rented successfully!');
            setCardId('');
            setRenterAddress('');
            setDuration('');
        } catch (err) {
            setError(err.message || 'Failed to rent card');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Rent Out Your Business Card</h2>
                
                <form onSubmit={handleRent} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Card ID
                        </label>
                        <input
                            type="number"
                            id="cardId"
                            value={cardId}
                            onChange={(e) => setCardId(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Renter's Address
                        </label>
                        <input
                            type="text"
                            id="renterAddress"
                            value={renterAddress}
                            onChange={(e) => setRenterAddress(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Duration (days)
                        </label>
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                 transition duration-200 ease-in-out transform hover:scale-105
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin mr-2 h-5 w-5 border-b-2 border-white rounded-full"></div>
                                Processing...
                            </div>
                        ) : (
                            'Rent Card'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentCard;