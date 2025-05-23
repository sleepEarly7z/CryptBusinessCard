import React, { useState } from 'react';
import axios from 'axios';

const Mint = ({ contract, account }) => {
    const [minting, setMinting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        contactInfo: '',
        tokenURI: ''
    });
    const [error, setError] = useState('');

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
                name: formData.name,
                description: "Digital Business Card NFT",
                image: `ipfs://${response.data.IpfsHash}`,
                attributes: [
                    { trait_type: "Name", value: formData.name },
                    { trait_type: "Title", value: formData.title },
                    { trait_type: "Company", value: formData.company }
                ]
            };

            // Upload to IPFS
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

    const mintNewCard = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (!image) {
                throw new Error('Please select an image');
            }

            setMinting(true);
            
            // Upload image and get tokenURI
            const tokenURI = await uploadToIPFS(image);
            
            const tx = await contract.mintBusinessCard(
                formData.name,
                formData.title,
                formData.company,
                formData.contactInfo,
                tokenURI
            );
            
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
                setImage(null);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            if (error.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected by user');
            } else {
                setError(error.message);
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
                            Upload Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={minting || uploading}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                                 transition duration-200 ease-in-out transform hover:scale-105
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >   
                        {minting ? 'Minting...' : uploading ? 'Uploading...' : 'Mint New Card'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Mint;