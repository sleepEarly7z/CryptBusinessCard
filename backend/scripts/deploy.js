const hre = require("hardhat");

async function main() {
    const BusinessCard = await hre.ethers.getContractFactory("BusinessCard");
    
    console.log("Deploying BusinessCard...");
    
    const businessCard = await hre.upgrades.deployProxy(BusinessCard, [], {
        initializer: "initialize",
        kind: "uups"
    });

    await businessCard.waitForDeployment();
    
    const contractAddress = await businessCard.getAddress();
    console.log(`BusinessCard proxy deployed at: ${contractAddress}`);

    const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(contractAddress);
    console.log(`BusinessCard implementation deployed at: ${implementationAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
