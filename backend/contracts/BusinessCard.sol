// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract BusinessCard is 
    Initializable, 
    ERC721URIStorageUpgradeable, 
    OwnableUpgradeable,
    UUPSUpgradeable {
    uint256 private _nextTokenId;

    struct CardDetails {
        string name;
        string title;
        string company;
        string contactInfo;
    }

    struct Rental {
        address renter;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    mapping(uint256 => CardDetails) public businessCards;
    mapping(address => uint256) public userCard;
    mapping(address => mapping(uint256 => bool)) public receivedCards;
    mapping(address => uint256[]) private userReceivedCards;
    mapping(uint256 => Rental) public cardRentals;
    mapping(address => uint256[]) private userRentedCards;
    mapping(address => bool) public approvedCardSenders;

    event BusinessCardMinted(address indexed owner, uint256 indexed cardId);
    event BusinessCardUpdated(address indexed owner, uint256 indexed cardId);
    event BusinessCardSent(address indexed from, address indexed to, uint256 cardId);
    event BusinessCardTraded(address indexed from, address indexed to, uint256 myCardId);
    event BusinessCardRented(address indexed owner, address indexed renter, uint256 cardId, uint256 duration);
    event BusinessCardRentalEnded(address indexed owner, address indexed renter, uint256 cardId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    function initialize() public initializer {
        __ERC721_init("BusinessCard", "BCARD");
        __Ownable_init(msg.sender);
        __ERC721URIStorage_init();
        __UUPSUpgradeable_init();
    }
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
        _setTokenURI(newCardId, _tokenURI);
        emit BusinessCardMinted(msg.sender, newCardId);
    }
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
    function sendBusinessCard(address _to, uint256 _cardId) public {
        require(_isAuthorized(_cardId), "Not authorized");
        receivedCards[_to][_cardId] = true;
        userReceivedCards[_to].push(_cardId);
        emit BusinessCardSent(msg.sender, _to, _cardId);
    }
    function getBusinessCard(uint256 _cardId) public view returns (CardDetails memory) {
        return businessCards[_cardId];
    }
    function getReceivedCards(address _owner) public view returns (uint256[] memory) {
        return userReceivedCards[_owner];
    }
    function getMultipleBusinessCards(uint256[] memory _cardIds) 
        public view returns (CardDetails[] memory) {
        CardDetails[] memory cards = new CardDetails[](_cardIds.length);
        for(uint i = 0; i < _cardIds.length; i++) {
            cards[i] = businessCards[_cardIds[i]];
        }
        return cards;
    }
    function rentBusinessCard(uint256 _cardId, address _renter, uint256 _duration) public {
        require(ownerOf(_cardId) == msg.sender && !cardRentals[_cardId].isActive && _duration > 0, "Invalid rental");
        uint256 startTime = block.timestamp;
        cardRentals[_cardId] = Rental({
            renter: _renter,
            startTime: startTime,
            endTime: startTime + _duration,
            isActive: true
        });
        userRentedCards[_renter].push(_cardId);
        emit BusinessCardRented(msg.sender, _renter, _cardId, _duration);
    }
    function endRental(uint256 _cardId) public {
        require(ownerOf(_cardId) == msg.sender || cardRentals[_cardId].renter == msg.sender, 
                "Only owner or renter can end rental");
        require(cardRentals[_cardId].isActive, "No active rental");
        cardRentals[_cardId].isActive = false;
        emit BusinessCardRentalEnded(ownerOf(_cardId), cardRentals[_cardId].renter, _cardId);
    }
    function getRentalStatus(uint256 _cardId) public view returns (
        bool isRented,
        address renter,
        uint256 remainingTime
    ) {
        Rental memory rental = cardRentals[_cardId];
        if (!rental.isActive) {
            return (false, address(0), 0);
        }
        uint256 remaining = rental.endTime > block.timestamp ? 
            rental.endTime - block.timestamp : 0;
        return (true, rental.renter, remaining);
    }
    function getRentedCards() public view returns (
        uint256[] memory cardIds,
        CardDetails[] memory cards,
        uint256[] memory remainingTimes
    ) {
        uint256[] memory rentedCardIds = userRentedCards[msg.sender];
        uint256 timestamp = block.timestamp;
        
        uint256 activeCount;
        for(uint256 i; i < rentedCardIds.length; ++i) {
            uint256 cardId = rentedCardIds[i];
            Rental storage rental = cardRentals[cardId];
            if(rental.isActive && rental.endTime > timestamp) {
                ++activeCount;
            }
        }

        cardIds = new uint256[](activeCount);
        cards = new CardDetails[](activeCount);
        remainingTimes = new uint256[](activeCount);

        uint256 j;
        for(uint256 i; i < rentedCardIds.length && j < activeCount; ++i) {
            uint256 cardId = rentedCardIds[i];
            Rental storage rental = cardRentals[cardId];
            if(rental.isActive && rental.endTime > timestamp) {
                cardIds[j] = cardId;
                cards[j] = businessCards[cardId];
                remainingTimes[j] = rental.endTime - timestamp;
                ++j;
            }
        }
    }
    function setCardSender(address _cardSender, bool _isApproved) external onlyOwner {
        approvedCardSenders[_cardSender] = _isApproved;
    }
    modifier onlyOwnerOrRenter(uint256 _cardId) {
        require(_isAuthorized(_cardId), "Not authorized");
        _;
    }
    function _isAuthorized(uint256 _cardId) internal view returns (bool) {
        return ownerOf(_cardId) == msg.sender || 
               (cardRentals[_cardId].isActive && cardRentals[_cardId].renter == msg.sender) ||
               approvedCardSenders[msg.sender];
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    uint256[50] private __gap;
}
