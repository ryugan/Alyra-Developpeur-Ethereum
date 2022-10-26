const SimpleStorage = artifacts.require('SimpleStorage')

const migration: Truffle.Migration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  const SimpleStorage = artifacts.require("SimpleStorage");

  await deployer.deploy(SimpleStorage);

  const simpleStorage = await SimpleStorage.deployed();
  console.log(
    `Contract deployed at ${simpleStorage.address} in network: ${network}.`
  );
};

module.exports = migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}