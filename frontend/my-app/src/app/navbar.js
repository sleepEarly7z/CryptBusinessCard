import React from 'react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-800">My dApp</span>
                    </div>

                    {/* Navigation Items */}
                    <div className="hidden sm:flex sm:items-center">
                        <ul className="flex space-x-8">
                            <li>
                                <a href="#mint" 
                                   className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    Mint
                                </a>
                            </li>
                            <li>
                                <a href="#send" 
                                   className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    Send
                                </a>
                            </li>
                            <li>
                                <a href="#view" 
                                   className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    View
                                </a>
                            </li>
                            <li>
                                <a href="#contact" 
                                   className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (hidden by default) */}
            <div className="sm:hidden hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <a href="#mint" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                        Mint
                    </a>
                    <a href="#send" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                        Send
                    </a>
                    <a href="#view" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                        View
                    </a>
                    <a href="#contact" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
                        Contact
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;