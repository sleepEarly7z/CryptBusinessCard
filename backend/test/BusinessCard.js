const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("BusinessCard", function() {
  async function deployBusinessCardFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    const BusinessCard = await ethers.getContractFactory("BusinessCard");
    const businessCard = await hre.upgrades.deployProxy(BusinessCard, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await businessCard.waitForDeployment();

    const cardDetails = {
      name: "Jack Doe",
      title: "Student",
      company: "UBC",
      contactInfo: "jack@ubc.ca",
      tokenURI: "ipfs://xxx"
    };

    return { businessCard, owner, user1, user2, user3, cardDetails };
  }

  describe("Deployment", function() {
    it("Should set correct owner address", async function() {
      const { businessCard, owner } = await loadFixture(deployBusinessCardFixture);
      expect(await businessCard.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function() {
    it("Should mint a new card with correct details", async function() {
      const { businessCard, user1, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title, 
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      const mintedCard = await businessCard.getBusinessCard(1);
      expect(mintedCard.name).to.equal(cardDetails.name);
      expect(mintedCard.title).to.equal(cardDetails.title);
      expect(mintedCard.company).to.equal(cardDetails.company);
      expect(mintedCard.contactInfo).to.equal(cardDetails.contactInfo);
    });

    it("Should prevent minting more than 1 card per address", async function() {
      const { businessCard, user1, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      await expect(
        businessCard.connect(user1).mintBusinessCard(
          cardDetails.name,
          cardDetails.title,
          cardDetails.company,
          cardDetails.contactInfo,
          cardDetails.tokenURI
        )
      ).to.be.revertedWith("Already owns a business card");
    });
  });

  describe("Card Operations", function() {
    it("Should update card details", async function() {
      const { businessCard, user1, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      const newDetails = {
        title: "Grad Student",
        company: "UBC MEng",
        contactInfo: "jack@ece.ubc.ca",
        tokenURI: "ipfs://ubc"
      };

      await businessCard.connect(user1).updateBusinessCard(
        1,
        newDetails.title,
        newDetails.company,
        newDetails.contactInfo,
        newDetails.tokenURI
      );

      const updatedCard = await businessCard.getBusinessCard(1);
      expect(updatedCard.title).to.equal(newDetails.title);
      expect(updatedCard.company).to.equal(newDetails.company);
      expect(updatedCard.contactInfo).to.equal(newDetails.contactInfo);
    });

    it("Should send business card to another user", async function() {
      const { businessCard, user1, user2, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      await expect(
        businessCard.connect(user1).sendBusinessCard(user2.address, 1)
      ).to.emit(businessCard, "BusinessCardSent")
        .withArgs(user1.address, user2.address, 1);
    });
  });

  describe("Rental Operations", function() {
    it("Should rent a card to another user", async function() {
      const { businessCard, user1, user2, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      const duration = 86400;

      await expect(
        businessCard.connect(user1).rentBusinessCard(1, user2.address, duration)
      ).to.emit(businessCard, "BusinessCardRented")
        .withArgs(user1.address, user2.address, 1, duration);

      const [isRented, renter, remainingTime] = await businessCard.getRentalStatus(1);
      expect(isRented).to.be.true;
      expect(renter).to.equal(user2.address);
      expect(remainingTime).to.be.approximately(duration, 5);
    });

    it("Should allow renter to send card", async function() {
      const { businessCard, user1, user2, user3, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );
      await businessCard.connect(user1).rentBusinessCard(1, user2.address, 86400);

      await expect(
        businessCard.connect(user2).sendBusinessCard(user3.address, 1)
      ).to.emit(businessCard, "BusinessCardSent")
        .withArgs(user2.address, user3.address, 1);
    });

    it("Should end rental properly", async function() {
      const { businessCard, user1, user2, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );
      await businessCard.connect(user1).rentBusinessCard(1, user2.address, 86400);

      await expect(
        businessCard.connect(user1).endRental(1)
      ).to.emit(businessCard, "BusinessCardRentalEnded")
        .withArgs(user1.address, user2.address, 1);

      const [isRented, , ] = await businessCard.getRentalStatus(1);
      expect(isRented).to.be.false;
    });

    it("Should get rented cards for user", async function() {
      const { businessCard, user1, user2, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );
      await businessCard.connect(user1).rentBusinessCard(1, user2.address, 86400);

      const [cardIds, cards, remainingTimes] = await businessCard.connect(user2).getRentedCards();
      
      expect(cardIds.length).to.equal(1);
      expect(cardIds[0]).to.equal(1);
      expect(cards[0].name).to.equal(cardDetails.name);
      expect(remainingTimes[0]).to.be.approximately(86400, 5);
    });

    it("Should prevent non-owner from renting card", async function() {
      const { businessCard, user1, user2, user3, cardDetails } = await loadFixture(deployBusinessCardFixture);
      
      await businessCard.connect(user1).mintBusinessCard(
        cardDetails.name,
        cardDetails.title,
        cardDetails.company,
        cardDetails.contactInfo,
        cardDetails.tokenURI
      );

      await expect(
        businessCard.connect(user2).rentBusinessCard(1, user3.address, 86400)
      ).to.be.revertedWith("Not your business card");
    });
  });
});