// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BusinessCard.sol";

contract CardRecommendation is ERC20, Ownable {
    BusinessCard public businessCardContract;
    // 1 token as the reward for a successful recommendation
    uint256 public constant RECOMMENDATION_REWARD = 1 * 10 ** 18;

    mapping(address => mapping(uint256 => bool)) public hasRecommendedCard;
    mapping(address => mapping(address => bool)) public hasRecommendedTo;
    mapping(address => mapping(address => uint256)) public pendingRecommendations;

    event RecommendationCreated(address indexed recommender, address indexed recommendee, uint256 cardId);
    event RecommendationAccepted(address indexed recommender, address indexed recommendee, uint256 cardId);

    constructor(address _businessCardContract) ERC20("RecommendToken", "REC") Ownable(msg.sender) {
        businessCardContract = BusinessCard(_businessCardContract);
    }

    function recommendCard(address _recommendee, uint256 _cardId) external {
        require(businessCardContract.receivedCards(msg.sender, _cardId), "You haven't received this card");
        require(!hasRecommendedCard[msg.sender][_cardId], "Already recommended this card");
        require(!hasRecommendedTo[msg.sender][_recommendee], "Already recommended to this person");
        
        pendingRecommendations[_recommendee][msg.sender] = _cardId;
        
        emit RecommendationCreated(msg.sender, _recommendee, _cardId);
    }

    function acceptRecommendation(address _recommender) external {
        uint256 cardId = pendingRecommendations[msg.sender][_recommender];
        require(cardId != 0, "No pending recommendation from this address");
        
        hasRecommendedCard[_recommender][cardId] = true;
        hasRecommendedTo[_recommender][msg.sender] = true;
        
        pendingRecommendations[msg.sender][_recommender] = 0;
        
        businessCardContract.sendBusinessCard(msg.sender, cardId);
        
        _mint(_recommender, RECOMMENDATION_REWARD);
        
        emit RecommendationAccepted(_recommender, msg.sender, cardId);
    }
}