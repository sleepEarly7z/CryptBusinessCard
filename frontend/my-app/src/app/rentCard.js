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
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Rent Out Your Business Card</h2>
            
            <form onSubmit={handleRent} className="space-y-6">
                <div>
                    <label htmlFor="cardId" className="block text-sm font-medium text-gray-700">
                        Card ID
                    </label>
                    <input
                        type="number"
                        id="cardId"
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="renterAddress" className="block text-sm font-medium text-gray-700">
                        Renter's Address
                    </label>
                    <input
                        type="text"
                        id="renterAddress"
                        value={renterAddress}
                        onChange={(e) => setRenterAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duration (days)
                    </label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin mr-2 h-5 w-5 border-b-2 border-white rounded-full"></div>
                            Processing...
                        </div>
                    ) : (
                        'Rent Card'
                    )}
                </button>
            </form>
        </div>
    );
};

export default RentCard;