import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, run } from "hardhat";
import { approve, getBalance, makeSwap } from "./utils";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const SAITANOBI = "0x5e9f35e8163c44cd7e606bdd716abed32ad2f1c6";
const SAITAMA = "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f";
const SHIBNOBI = "0xab167E816E4d76089119900e941BEfdfA37d6b32";

async function main() {
    const accounts: SignerWithAddress[] = await ethers.getSigners();
    const Stake = await ethers.getContractFactory("MultiRewardsStake");
    const stake = await Stake.deploy(
      [SAITAMA, SHIBNOBI],
      SAITANOBI
    );
    await stake.deployed();

    await makeSwap(accounts[0], [WETH, SAITAMA], '4.0');
    await makeSwap(accounts[0], [WETH, SHIBNOBI], '4.0');
    await makeSwap(accounts[0], [WETH, SAITANOBI], '1.0');
    await makeSwap(accounts[1], [WETH, SAITANOBI], '1.0');

    await ethers.provider.send('evm_mine', []);

    let saitamaBalance = await getBalance(SAITAMA, accounts[0].address);
    let shibnobiBalance = await getBalance(SHIBNOBI, accounts[0].address);
    const saitanobiBalance = await getBalance(SAITANOBI, accounts[0].address);

    // await transfer(SAITAMA, accounts[0], stake.address, saitamaBalance);
    // await transfer(SHIBNOBI, accounts[0], stake.address, shibnobiBalance);

    await approve(SAITAMA, accounts[0], stake.address, saitamaBalance);
    await approve(SHIBNOBI, accounts[0], stake.address, shibnobiBalance);

    await stake.depositRewardTokens([saitamaBalance, shibnobiBalance]);

    await ethers.provider.send('evm_mine', []);

    await makeSwap(accounts[0], [WETH, SAITAMA], '4.0');
    await makeSwap(accounts[0], [WETH, SHIBNOBI], '4.0');

    await ethers.provider.send('evm_mine', []);

    await approve(SAITAMA, accounts[0], stake.address, saitamaBalance);
    await approve(SHIBNOBI, accounts[0], stake.address, shibnobiBalance);

    await ethers.provider.send('evm_mine', []);

    saitamaBalance = await getBalance(SAITAMA, accounts[0].address);
    shibnobiBalance = await getBalance(SHIBNOBI, accounts[0].address);

    await stake.depositRewardTokens([saitamaBalance, shibnobiBalance]);

    // const contractBalanceSaitama = await getBalance(SAITAMA, stake.address);
    // const contractBalanceShibnobi = await getBalance(SHIBNOBI, stake.address);

    // await stake.connect(accounts[0]).notifyRewardAmount([contractBalanceSaitama, contractBalanceShibnobi]);

    await ethers.provider.send('evm_mine', []);

    const stakeAmount = saitanobiBalance.div(2);

    await approve(SAITANOBI, accounts[0], stake.address, stakeAmount);
    await stake.connect(accounts[0]).stake(stakeAmount);

    await ethers.provider.send('evm_mine', []);
    await ethers.provider.send('evm_mine', []);
    await ethers.provider.send('evm_mine', []);
    await ethers.provider.send('evm_mine', []);

    console.log(await stake.earned(accounts[0].address));

    await run('node');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });