import React from 'react';

const Navbar = ({onNavigate, isWalletConnected}) => {
    const navItems = [
        { name: 'Mint', route: 'mint' },
        { name: 'Send Card', route: 'send' },
        { name: 'View Received Cards', route: 'view' },
        { name: 'Update Card', route: 'update' },
        { name: 'Rent Card', route: 'rent' },
        { name: 'View Rented Cards', route: 'viewRented' },
        { name: 'Manage Rentals', route: 'manageRental' },
        { name: 'Recommend Card', route: 'recommend' }
    ];

    const handleLogoClick = () => {
        if (isWalletConnected) {
            onNavigate('home');
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span 
                            onClick={handleLogoClick}
                            className="text-2xl font-bold text-black-600 cursor-pointer hover:text-blue-700 transition-colors duration-200"
                        >
                            CryptBusinessCard
                        </span>
                    </div>

                    <div className="flex items-center overflow-x-auto no-scrollbar">
                        <ul className="flex space-x-2">
                            {navItems.map((item) => (
                                <li key={item.route}>
                                    <button 
                                        onClick={() => onNavigate(item.route)}
                                        className="whitespace-nowrap text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;