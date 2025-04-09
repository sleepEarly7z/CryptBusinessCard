const hre = require("hardhat");

async function main() {
    const BusinessCard = await hre.ethers.getContractFactory("BusinessCard");
    
    console.log("Deploying BusinessCard...");
    
    const businessCard = await hre.upgrades.deployProxy(BusinessCard, [], {
        initializer: "initialize",
        kind: "uups"
    });

    await businessCard.waitForDeployment();
    
    const businessCardAddress = await businessCard.getAddress();
    console.log(`BusinessCard proxy deployed at: ${businessCardAddress}`);

    const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(businessCardAddress);
    console.log(`BusinessCard implementation deployed at: ${implementationAddress}`);

    console.log("\nDeploying CardRecommendation...");
    const CardRecommendation = await hre.ethers.getContractFactory("CardRecommendation");
    const cardRecommendation = await CardRecommendation.deploy(businessCardAddress);
    
    await cardRecommendation.waitForDeployment();
    const recommendationAddress = await cardRecommendation.getAddress();
    console.log(`CardRecommendation deployed at: ${recommendationAddress}`);

    console.log("\nSetting card sender approval...");
    try {
        const tx = await businessCard.setCardSender(recommendationAddress, true);
        await tx.wait();
        console.log("Card sender approval set successfully");
    } catch (error) {
        console.error("Error setting card sender approval:", error);
    }

    console.log("\nVerifying contracts on Etherscan...");
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            contract: "contracts/BusinessCard.sol:BusinessCard"
        });
        
        await hre.run("verify:verify", {
            address: recommendationAddress,
            contract: "contracts/CardRecommendation.sol:CardRecommendation",
            constructorArguments: [businessCardAddress],
        });
        
        console.log("Verification completed successfully");
    } catch (error) {
        console.log("Error verifying contracts:", error);
    }

    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log(`BusinessCard Proxy: ${businessCardAddress}`);
    console.log(`BusinessCard Implementation: ${implementationAddress}`);
    console.log(`CardRecommendation: ${recommendationAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
