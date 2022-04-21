import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { approve, getBalance, makeSwap, transfer } from "../scripts/utils";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const SAITANOBI = "0x5e9f35e8163c44cd7e606bdd716abed32ad2f1c6";
const SAITAMA = "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f";
const SHIBNOBI = "0xab167E816E4d76089119900e941BEfdfA37d6b32";
const SHIB = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE";

describe("MultiRewardsStake", function () {
  it("Should allow add tokens, remove tokens, stake, and withdraw", async function () {
    const accounts: SignerWithAddress[] = await ethers.getSigners();
    const Stake = await ethers.getContractFactory("MultiRewardsStake");
    const stake = await Stake.deploy(
      [SAITAMA, SHIBNOBI],
      SAITANOBI
    );
    await stake.deployed();

    console.log(`Deployed: ${stake.address}`);

    expect(await stake.totalRewardTokens()).to.equal(2);

    await makeSwap(accounts[0], [WETH, SAITAMA], '4.0');
    await makeSwap(accounts[0], [WETH, SHIBNOBI], '4.0');
    await makeSwap(accounts[0], [WETH, SHIB], '4.0');
    await makeSwap(accounts[0], [WETH, SAITANOBI], '1.0');
    await makeSwap(accounts[1], [WETH, SAITANOBI], '1.0');

    await ethers.provider.send('evm_mine', []);

    let saitamaBalance = await getBalance(SAITAMA, accounts[0].address);
    let shibnobiBalance = await getBalance(SHIBNOBI, accounts[0].address);
    const saitanobiBalance = await getBalance(SAITANOBI, accounts[0].address);

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
    const shibBalance = await getBalance(SHIB, accounts[0].address);

    await stake.depositRewardTokens([saitamaBalance, shibnobiBalance]);

    await ethers.provider.send('evm_mine', []);

    const stakeAmount = saitanobiBalance.div(2);

    await approve(SAITANOBI, accounts[0], stake.address, stakeAmount);
    await approve(SAITANOBI, accounts[1], stake.address, await getBalance(SAITANOBI, accounts[0].address));
    await stake.connect(accounts[0]).stake(stakeAmount);
    await stake.connect(accounts[1]).stake(await getBalance(SAITANOBI, accounts[0].address));

    await ethers.provider.send('evm_mine', []);
    
    const earned1 = await stake.earned(accounts[0].address);
    const earned2 = await stake.earned(accounts[1].address);

    expect(Number(ethers.utils.formatUnits(earned1[0], 'gwei'))).to.greaterThan(0);
    expect(Number(ethers.utils.formatUnits(earned1[1], 'gwei'))).to.greaterThan(0);
    expect(Number(ethers.utils.formatUnits(earned2[0], 'gwei'))).to.greaterThan(0);
    expect(Number(ethers.utils.formatUnits(earned2[1], 'gwei'))).to.greaterThan(0);

    await ethers.provider.send('evm_mine', []);
    await ethers.provider.send('evm_mine', []);
    await ethers.provider.send('evm_mine', []);

    console.log(await stake.rewardPerToken());

    await transfer(SHIB, accounts[0], stake.address, shibBalance);

    const contractShibBalance = await getBalance(SHIB, stake.address);

    // await stake.addRewardToken(SHIB);

    // await ethers.provider.send('evm_increaseTime', [2628000]);
    await ethers.provider.send('evm_mine', []);
    
    // await stake.connect(accounts[0]).exit();
    // await stake.connect(accounts[1]).exit();

    // console.log(await stake.getRewardTokens());
    console.log(await stake.rewardPerToken());
    console.log(await getBalance(SHIB, accounts[1].address));

    // const leftover = await stake.totalSupply();

    // expect(Number(leftover)).to.equal(0);

    // await stake.connect(accounts[0]).transferOwnership(accounts[1].address);

    // await ethers.provider.send('evm_mine', []);

    // expect(await stake.owner()).to.equal(accounts[1].address);
  });
});