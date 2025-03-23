'use client';
import { useState, useEffect } from 'react';

const ManageRental = ({ contract, account }) => {
    const [rentalStatus, setRentalStatus] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchRentalDetails = async () => {
        setIsLoading(true);
        try {
            const cardId = await contract.userCard(account);
            if (cardId.toString() === '0') {
                setError('You do not own a business card');
                return;
            }

            const [isRented, renter, remainingTime] = await contract.getRentalStatus(cardId);
            if (!isRented) {
                setRentalStatus(null);
                return;
            }

            const details = await contract.getBusinessCard(cardId);
            setCardDetails(details);
            setRentalStatus({ cardId, renter, remainingTime });

        } catch (err) {
            setError('Failed to fetch rental details: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const endRental = async () => {
        try {
            setError(null);
            setSuccess(null);
            const tx = await contract.endRental(rentalStatus.cardId);
            await tx.wait();
            setSuccess('Successfully ended rental');
            fetchRentalDetails();
        } catch (err) {
            setError('Failed to end rental: ' + err.message);
        }
    };

    useEffect(() => {
        if (contract && account) {
            fetchRentalDetails();
        }
    }, [contract, account]);

    const formatTimeRemaining = (seconds) => {
        try {
            const secondsNum = Number(seconds);
            if (!Number.isFinite(secondsNum)) {
                return 'Invalid duration';
            }
            const days = Math.floor(secondsNum / (24 * 60 * 60));
            const hours = Math.floor((secondsNum % (24 * 60 * 60)) / (60 * 60));
            return `${days}d ${hours}h`;
        } catch (error) {
            return 'Error calculating time';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Card Rental</h2>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                    {success}
                </div>
            )}

            {!rentalStatus ? (
                <div className="text-gray-600 text-center py-8">
                    Your card is not currently rented out.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {cardDetails.name}
                        </h3>
                        <p className="text-gray-700">
                            <span className="font-semibold">Rented to:</span> 
                            <span className="font-mono text-sm break-all"> {rentalStatus.renter}</span>
                        </p>
                        <p className="text-blue-600 font-semibold">
                            Time Remaining: {formatTimeRemaining(rentalStatus.remainingTime)}
                        </p>
                        
                        <button
                            onClick={endRental}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                        >
                            End Rental
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRental;