const hre = require("hardhat");

async function main() {
    const BusinessCard = await hre.ethers.getContractFactory("BusinessCard");
    const businessCard = await BusinessCard.deploy();
    
    await businessCard.waitForDeployment();

    const contractAddress = await businessCard.getAddress();

    console.log(`✅ BusinessCard deployed at: ${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
