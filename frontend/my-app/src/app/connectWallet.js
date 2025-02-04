const ConnectWallet = ({ connectWallet }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Business Card dApp
            </h1>
            <p className="text-gray-600 mb-8 text-center max-w-md">
                Connect your wallet to mint and manage your digital business cards
            </p>
            <button 
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
                         transition duration-200 ease-in-out transform hover:scale-105 
                         shadow-lg hover:shadow-xl"
            >
                Connect Wallet
            </button>
        </div>
    );
};

export default ConnectWallet;