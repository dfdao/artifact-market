// script for deploying new contract each round
import { ethers as _ethers, network } from 'hardhat';
import { TOKENS_ADDRESS } from '@darkforest-eth/contracts';

async function main(){
    const abi =[
        "function newRound(address newTokens)"
    ];
    const [deployer] = await _ethers.getSigners();
    factory = new _ethers.Contract('0xACE32941F16ec7f528067Ed4745e4411A42a5609',abi,network.provider);
    const deployNewRound = await factory.newRound(TOKENS_ADDRESS);
    deployNewRound.wait();

    //const from = "0xACE32941F16ec7f528067Ed4745e4411A42a5609";
    //const salt = "0xa57605b2e24b1510bf138d6701553196cf98ca6c1e364020d33d6cef72d1be96";
    //const creationHash = "0x86529331489ea7a1cc82140188cdba7d19dcd8f3d1376d95981e61e511308a42"; 
    //newRoundAddress(from,salt,creationHash);
}

function newRoundAddress(from,salt,creationHash){
    return ethers.utils.getCreate2Address(from,salt,creationHash);
}
