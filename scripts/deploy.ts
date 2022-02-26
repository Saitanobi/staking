// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const SAITANOBI = "0x5e9f35e8163c44cd7e606bdd716abed32ad2f1c6";
const SAITAMA = "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f";
const SHIBNOBI = "0xab167E816E4d76089119900e941BEfdfA37d6b32";
const OWNER = "0xE1d8e50e2D8A066Dd92578099f8c0b16d0647635";

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    const Stake = await ethers.getContractFactory("MultiRewardsStake");
    // Fill in reward tokens in array, and staking token as final perameter
    const stake = await Stake.deploy([SAITAMA, SHIBNOBI], SAITANOBI);
    await stake.deployed();
    await stake.transferOwnership(OWNER);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
