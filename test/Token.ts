import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";

describe("MyToken", function () {

  it("Should deploy with correct name, symbol, decimals, and initial supply", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    expect(await token.name()).to.equal("YukayToken");
    expect(await token.symbol()).to.equal("YUK");
    expect(await token.decimals()).to.equal(18);
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000"));
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000"));
  });

  it("Should transfer tokens between accounts", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    await token.transfer(addr1.address, ethers.parseEther("100"));

    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("900"));
  });

  it("Should fail if sender has insufficient balance", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    await expect(
      token.connect(addr1).transfer(owner.address, ethers.parseEther("1"))
    ).to.be.revertedWith("Not enough balance");
  });

  it("Should approve allowance correctly", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    await token.approve(addr1.address, ethers.parseEther("200"));

    expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("200"));
  });

  it("Should allow transferFrom within allowance", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    // Owner approves address_1 to spend 200
    await token.approve(addr1.address, ethers.parseEther("200"));

    // address_1 transfers 100 to addr2
    await token.connect(addr1).transferFrom(
      owner.address,
      addr2.address,
      ethers.parseEther("100")
    );

    expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("900"));
    expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("100")); // 200 - 100
  });

  it("Should fail transferFrom if allowance is not enough", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    const token = (await Token.deploy(ethers.parseEther("1000"))) as MyToken;

    // Approve only 50
    await token.approve(addr1.address, ethers.parseEther("50"));

    // address_1 tries to transfer 100 → should fail
    await expect(
      token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("100"))
    ).to.be.revertedWith("Allowance exceeded");
  });
});
