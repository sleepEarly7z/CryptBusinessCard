'use client';
import React, { useState } from 'react';

const MyCard = ({ contract, account }) => {
    const [minting, setMinting] = useState(false);

    const mintNewCard = async () => {
        try {
            setMinting(true);
            // Call the contract's mint function
            contract.mintBusinessCard('John Doe', '123', 'Software Engineer', '123', '123-456-7890');
            alert('Card minted successfully!');
        } catch (error) {
            console.error('Error minting card:', error);
            alert('Failed to mint card');
        } finally {
            setMinting(false);
        }
    };

    const getCardInfo = async () => {
        try {
            // Call the contract's getCardInfo function
            const cardInfo = await contract.userCard(account);
            console.log('Card Info:', cardInfo);
            const cardDetails = await contract.getBusinessCard(cardInfo);
            console.log("Name:", cardDetails.name);
            console.log("Title:", cardDetails.title);
            console.log("Company:", cardDetails.company);
            console.log("Contact Info:", cardDetails.contactInfo);
        } catch (error) {
            console.error('Error getting card info:', error);
        }
    };

    const removeCard = async () => {
        try {
            // Call the contract's removeCard function
            const cardInfo = await contract.userCard(account);
            console.log('Card Info:', cardInfo);
            contract.burnCard(cardInfo);
            alert('Card removed successfully!');
        } catch (error) {
            console.error('Error removing card:', error);
            alert('Failed to remove card');
        }
    };

    return (
        <div className="card">
            <button 
                onClick={mintNewCard} 
                disabled={minting}
            >
                {minting ? 'Minting...' : 'Mint New Card'}
            </button>
            <button onClick={getCardInfo}>Get Card Info</button>
            <button onClick={removeCard}>Remove Card</button>
            
        </div>
    );
};

export default MyCard;