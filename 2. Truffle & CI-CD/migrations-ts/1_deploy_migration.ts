
const migration: Truffle.Migration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  const Voting = artifacts.require("Voting");

  await deployer.deploy(Voting);

  const voting = await Voting.deployed();
  console.log(
    `Contract deployed at ${voting.address} in network: ${network}.`
  );
};

module.exports = migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}