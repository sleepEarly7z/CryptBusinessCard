import React, { useState } from 'react';

const Mint = ({ contract, account }) => {
    const [minting, setMinting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        contactInfo: '',
        tokenURI: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const mintNewCard = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            setMinting(true);
            const tx = await contract.mintBusinessCard(
                formData.name,
                formData.title,
                formData.company,
                formData.contactInfo,
                formData.tokenURI
            );
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                alert('Card minted successfully!');
                setFormData({
                    name: '',
                    title: '',
                    company: '',
                    contactInfo: '',
                    tokenURI: ''
                });
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            // console.error('Error minting card:', error);
            if (error.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected by user');
            } else if (error.message === 'Already owns a business card') {
                setError("Failed to mint card - You already own a business card");
            } else {
                setError("Failed to mint card - You already own a business card");
            }
        } finally {
            setMinting(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mint New Business Card</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={mintNewCard} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Company
                        </label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Contact Info
                        </label>
                        <input
                            type="text"
                            name="contactInfo"
                            value={formData.contactInfo}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Token URI
                        </label>
                        <input
                            type="text"
                            name="tokenURI"
                            value={formData.tokenURI}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={minting}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                 transition duration-200 ease-in-out transform hover:scale-105
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >   
                        {minting ? 'Minting...' : 'Mint New Card'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Mint;