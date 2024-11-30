const hre = require("hardhat");

async function main() {
  const initialSupply = hre.ethers.utils.parseUnits("103", 18);
  const FarhangToken = await hre.ethers.getContractFactory("FarhangToken");
  const farhangToken = await FarhangToken.deploy(initialSupply);

  await farhangToken.deployed();

  console.log("FarhangToken deployed to:", farhangToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
