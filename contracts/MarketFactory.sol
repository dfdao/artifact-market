//SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

interface IERC721{
    function transferFrom(address from, address to, uint tokenID) external;
}

contract MarketV2{
  
    event Sale(
        uint indexed id,
        address indexed buyer
    );

    event Listed(
        uint indexed id,
        uint indexed price,
        address indexed seller
    );

    event Unlisted(
        uint indexed id,
    );
  
    /**
     * @dev New in this version: no more 'Listing' struct. i use the a hash of the 2 values that would've been in that struct to save gas
     * 
     */     
    mapping(uint => bytes32) public listings; // all listings 
    IERC721 immutable DFTokens; 
        
    constructor(address tokensAddress){
        DFTokens = IERC721(tokensAddress);  
    }

    // sendValue from openZeppelin Address library https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol
    function sendValue(address payable recipient, uint amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    function list(uint tokenID, uint price) external  {
        listings[tokenID] = keccak256(abi.encode(msg.sender,price));
        DFTokens.transferFrom(msg.sender, address(this), tokenID);
        emit Listed(tokenID,price,msg.sender);
    }

    // buying function. User input is the price they pay
    function buy(uint tokenID, address seller) external payable  {
        bytes32 oldListing = listings[tokenID];
        delete listings[tokenID];
        require (keccak256(abi.encode(seller,msg.value)) == listings[tokenID], "wrong value / wrong address entered");
        DFTokens.transferFrom(address(this), msg.sender, tokenID);
        sendValue(payable(seller), msg.value);
        emit Sale(tokenID,msg.sender);
    }
    
    // Unlist a token you listed
    // Useful if you want your tokens back
    function unlist (uint tokenID, uint price) external {
        require(keccak256(abi.encode(msg.sender,price))==listings[tokenID], "not owner / wrong price provided");
        delete listings[tokenID];
        DFTokens.transferFrom(address(this), msg.sender, tokenID);
        emit Unlisted(tokenID);
    }

}

contract MarketFactory{

    address public admin;  // The admin can reset the token contract after each new round
    address public pendingAdmin; // the pending admin in case admin transfers ownership

    function newRound(address newTokens) external{
        require(msg.sender == admin, "admin function only");
        MarketV2 m = new MarketV2{salt: keccak256(abi.encode(address(this))}(newTokens);
    }

    function giveOwnership(address newOwner) external{
        require(msg.sender == admin, "admin function only");
        pendingAdmin = newOwner;
    }

    function acceptOwnership() external{
        require(msg.sender == pendingAdmin, "you are not the pending admin");
        admin = pendingAdmin;
    }
}