// script for deploying new contract each round
import { ethers as _ethers, network } from 'hardhat';
import { TOKENS_ADDRESS } from '@darkforest-eth/contracts';

async function main(){
    const abi =[
        "function newRound(address newTokens)"
    ];
    const [deployer] = await _ethers.getSigners();
    factory = new _ethers.Contract('0xd12E15f2EFE5acd79333E869930FFF0F679A46f9',abi,network.provider);
    const deployNewRound = await factory.newRound(TOKENS_ADDRESS);
    deployNewRound.wait();

    //const from = "0xd12E15f2EFE5acd79333E869930FFF0F679A46f9";
    //const salt = "";
    //const creationHash = ""; 
    //newRoundAddress(from,salt,creationHash);
}

function newRoundAddress(from,salt,creationHash){
    return ethers.utils.getCreate2Address(from,salt,creationHash);
}
