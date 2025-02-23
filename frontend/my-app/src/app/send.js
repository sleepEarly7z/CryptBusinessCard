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

            // Send the business card
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
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Business Card</h2>
            
            <form onSubmit={handleSendCard}>
                <div className="mb-4">
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Address
                    </label>
                    <input
                        type="text"
                        id="recipient"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium 
                        ${isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isLoading ? 'Sending...' : 'Send Business Card'}
                </button>
            </form>

            {status && (
                <div className={`mt-4 p-3 rounded-md ${
                    status.startsWith('Error') 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                }`}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default Send;