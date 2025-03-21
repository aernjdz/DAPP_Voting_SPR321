async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Voting contract
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  // Wait for the deployment to be mined (transaction confirmation)
  await voting.waitForDeployment();

  // Get the deployed contract address
  const votingAddress = await voting.getAddress();

  console.log("Voting contract deployed to:", votingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });