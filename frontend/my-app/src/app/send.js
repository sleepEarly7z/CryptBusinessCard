'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

const Send = ({ contract, account }) => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCard = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('');

        try {
            if (!ethers.isAddress(recipientAddress)) {
                throw new Error('Invalid recipient address');
            }

            const userCardId = await contract.userCard(account);
            
            if (userCardId === 0) {
                throw new Error('You do not own a business card');
            }

            const tx = await contract.sendBusinessCard(recipientAddress, userCardId);
            await tx.wait();

            setStatus('Business card sent successfully!');
            setRecipientAddress('');
        } catch (error) {
            console.error('Error sending business card:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Business Card</h2>
                
                {status && status.startsWith('Error') && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {status}
                    </div>
                )}

                {status && !status.startsWith('Error') && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        {status}
                    </div>
                )}
                
                <form onSubmit={handleSendCard} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="0x..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                 transition duration-200 ease-in-out transform hover:scale-105
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Business Card'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Send;