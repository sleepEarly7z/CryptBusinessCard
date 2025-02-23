// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BusinessCard is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct CardDetails {
        string name;
        string title;
        string company;
        string contactInfo;
    }

    mapping(uint256 => CardDetails) public businessCards;
    mapping(address => uint256) public userCard;
    mapping(address => mapping(uint256 => bool)) public receivedCards;
    mapping(address => uint256[]) private userReceivedCards;

    event BusinessCardMinted(address indexed owner, uint256 indexed cardId);
    event BusinessCardUpdated(address indexed owner, uint256 indexed cardId);
    event BusinessCardSent(address indexed from, address indexed to, uint256 cardId);
    event BusinessCardTraded(address indexed from, address indexed to, uint256 myCardId);

    constructor() ERC721("BusinessCard", "BCARD") Ownable(msg.sender) {}

    /// @notice Mint a new business card NFT
    function mintBusinessCard(
        string memory _name, 
        string memory _title, 
        string memory _company, 
        string memory _contactInfo,
        string memory _tokenURI
    ) public {
        require(userCard[msg.sender] == 0, "Already owns a business card");

        _nextTokenId++;
        uint256 newCardId = _nextTokenId;

        businessCards[newCardId] = CardDetails(_name, _title, _company, _contactInfo);
        userCard[msg.sender] = newCardId;

        _mint(msg.sender, newCardId);
        _setTokenURI(newCardId, _tokenURI); // Set metadata

        emit BusinessCardMinted(msg.sender, newCardId);
    }

    /// @notice Update business card details
    function updateBusinessCard(
        uint256 _cardId, 
        string memory _title, 
        string memory _company, 
        string memory _contactInfo,
        string memory _tokenURI
    ) public {
        require(ownerOf(_cardId) == msg.sender, "Not your business card");

        businessCards[_cardId].title = _title;
        businessCards[_cardId].company = _company;
        businessCards[_cardId].contactInfo = _contactInfo;

        _setTokenURI(_cardId, _tokenURI);

        emit BusinessCardUpdated(msg.sender, _cardId);
    }

    /// @notice Send a business card to another user (does not transfer ownership)
    function sendBusinessCard(address _to, uint256 _cardId) public {
        require(ownerOf(_cardId) == msg.sender, "You don't own this card");

        receivedCards[_to][_cardId] = true;
        userReceivedCards[_to].push(_cardId);

        emit BusinessCardSent(msg.sender, _to, _cardId);
    }

    /// @notice Trade business cards between two users
    function tradeCards(address _with, uint256 _myCardId, uint256 _theirCardId) public {
        require(ownerOf(_myCardId) == msg.sender, "You must own your card");
        require(ownerOf(_theirCardId) == _with, "They must own their card");

        _transfer(msg.sender, _with, _myCardId);
        _transfer(_with, msg.sender, _theirCardId);

        emit BusinessCardTraded(msg.sender, _with, _myCardId);
    }

    /// @notice Allow trading via a QR-based URL scan
    function tradeCardViaQR(address _recipient, uint256 _myCardId) public {
        require(ownerOf(_myCardId) == msg.sender, "Not your business card");

        _transfer(msg.sender, _recipient, _myCardId);

        emit BusinessCardTraded(msg.sender, _recipient, _myCardId);
    }

    /// @notice Get business card details
    function getBusinessCard(uint256 _cardId) public view returns (CardDetails memory) {
        return businessCards[_cardId];
    }

    /// @notice Get all received cards for an address
    function getReceivedCards(address _owner) public view returns (uint256[] memory) {
        return userReceivedCards[_owner];
    }

    /// @notice Get multiple business card details at once
    function getMultipleBusinessCards(uint256[] memory _cardIds) 
        public view returns (CardDetails[] memory) {
        CardDetails[] memory cards = new CardDetails[](_cardIds.length);
        for(uint i = 0; i < _cardIds.length; i++) {
            cards[i] = businessCards[_cardIds[i]];
        }
        return cards;
    }

    /// @notice Burn (delete) a business card
    function burnCard(uint256 _cardId) public {
        require(ownerOf(_cardId) == msg.sender, "You don't own this card");

        delete businessCards[_cardId];
        delete userCard[msg.sender];

        _burn(_cardId);
    }
}
