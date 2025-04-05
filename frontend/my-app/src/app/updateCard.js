import React, { useState } from 'react';
import axios from 'axios';

const UpdateCard = ({ contract, account }) => {
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        contactInfo: '',
    });
    const [error, setError] = useState('');
    const [cardId, setCardId] = useState(null);

    React.useEffect(() => {
        const fetchCardId = async () => {
            try {
                const userCardId = await contract.userCard(account);
                setCardId(userCardId);
            } catch (error) {
                console.error('Error fetching card ID:', error);
                setError('Failed to fetch your card ID');
            }
        };
        
        if (contract && account) {
            fetchCardId();
        }
    }, [contract, account]);

    const uploadToIPFS = async (file) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
                        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
                    }
                }
            );

            const metadata = {
                name: "Business Card",
                description: "Updated Digital Business Card NFT",
                image: `ipfs://${response.data.IpfsHash}`,
                attributes: [
                    { trait_type: "Title", value: formData.title },
                    { trait_type: "Company", value: formData.company }
                ]
            };

            const metadataResponse = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                metadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
                        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
                    }
                }
            );

            return `ipfs://${metadataResponse.data.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading to IPFS:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateCard = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (!cardId) {
                throw new Error('No card found to update');
            }

            setUpdating(true);
            
            const tokenURI = image ? await uploadToIPFS(image) : '';
            
            const tx = await contract.updateBusinessCard(
                cardId,
                formData.title,
                formData.company,
                formData.contactInfo,
                tokenURI || ''
            );
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                alert('Card updated successfully!');
                setFormData({
                    title: '',
                    company: '',
                    contactInfo: '',
                });
                setImage(null);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            if (error.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected by user');
            } else {
                setError(error.message);
            }
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Business Card</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={updateCard} className="space-y-4">
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
                            Update Image (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={updating || uploading}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                 transition duration-200 ease-in-out transform hover:scale-105
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >   
                        {updating ? 'Updating...' : uploading ? 'Uploading...' : 'Update Card'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateCard;