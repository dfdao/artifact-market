//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IERC721{
    function transferFrom(address from, address to, uint256 tokenID) external;
}


contract Market{
    
    struct Listing{
        address owner;       // who owns the listed artifact
        uint256 buyoutPrice; // price of the artifact in xdai
    }
    
    event Sale(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round
    );
    
    event Listed(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round
    );
    
    event Unlisting(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round
    );
    
    address public admin;  // The admin can reset the token contract after each new round
    address public pendingAdmin; // the pending admin in case admin transfers ownership
    mapping(bytes32 => Listing) public listings; // all listings     mapping(uint256 => IERC721) public contracts; // the different token contracts supported
    mapping(uint256 => IERC721) public contracts; // the different token contracts supported
    uint256 numContracts;
    
    constructor(address tokensAddress){
        admin = msg.sender; // admin can upgrade to new rounds
        contracts[0] = IERC721(tokensAddress);  
    }


    // sendValue from openZeppelin Address library https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    function list(uint256 tokenID, uint256 price, uint256 contractNo) external  {
        listings[keccak256(abi.encode(tokenID,contractNo))] = Listing({
            owner: msg.sender,
            buyoutPrice: price
        });
        
        contracts[contractNo].transferFrom(msg.sender, address(this), tokenID);
        emit Listed(tokenID,price,contractNo);
    }

    // buying function. User input is the price they pay
    function buy(bytes32 listingHash, uint256 contractNo, uint256 tokenID) external payable  {
        Listing memory oldListing = listings[listingHash];
        delete listings[listingHash];
        require (msg.value == oldListing.buyoutPrice, "wrong value");
        contracts[contractNo].transferFrom(address(this), msg.sender, tokenID);
        sendValue(payable(oldListing.owner), oldListing.buyoutPrice);
        emit Sale(tokenID,msg.value,contractNo);
    }
    
    
    // Unlist a token you listed
    // Useful if you want your tokens back
    function unlist (uint256 price, uint256 id ,bytes32 listingHash, uint256 contractNo) external {
        address holder = listings[listingHash].owner;
        require(msg.sender == holder);
        delete listings[listingHash];
        contracts[contractNo].transferFrom(address(this), msg.sender, id);
        emit Unlisting(id,price,contractNo);
    }


    // ADMIN 
    // Change the tokens address between rounds
    // WARNING: the trust given to admin is quite high.
    
    // This function is where the danger is.
    // If admin adds a custom contract that isn't actually ERC721 but instead does something possibly bad
    // TODO: find out the severity of the bad things admin could do
    function addContract(address tokens) external{
        numContracts++;
        require(msg.sender == admin, "admin function only");
        contracts[numContracts] = IERC721(tokens);
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

