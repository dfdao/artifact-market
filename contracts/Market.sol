//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IERC721{
    function transferFrom(address from, address to, uint256 tokenID) external;
}


contract Market{

    event Sale(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round,
        address seller // maybe have this be buyer instead
    );

    event Listing(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round,
        address seller
    );

    event Unlisting(
        uint256 indexed id,
        uint256 indexed price,
        uint256 indexed round,
        address seller
    );

    address public admin;  // The admin can reset the token contract after each new round
    address public pendingAdmin; // the pending admin in case admin transfers ownership
    mapping(bytes32 => bytes32) public listings; // all listings
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
        listings[keccak256(abi.encode(tokenID,contractNo))] = keccak256(abi.encode(msg.sender,price));
        contracts[contractNo].transferFrom(msg.sender, address(this), tokenID);
        emit Listing(tokenID,price,contractNo,msg.sender);
    }

    // buying function. User input is the price they pay
    function buy(bytes32 listingHash, uint256 contractNo, uint256 tokenID, address seller) external payable  {
        bytes32 oldListing = listings[listingHash];
        delete listings[listingHash];
        require(keccak256(abi.encode(tokenID,contractNo))==listingHash,"wrong listing");
        require(oldListing == keccak256(abi.encode(seller,msg.value)),"wrong value or seller");
        contracts[contractNo].transferFrom(address(this), msg.sender, tokenID);
        sendValue(payable(seller), msg.value);
        emit Sale(tokenID,msg.value,contractNo,seller);
    }


    // Unlist a token you listed
    // Useful if you want your tokens back
    function unlist (bytes32 listingHash, uint256 contractNo, uint256 tokenID, uint256 price) external {
        require(keccak256(abi.encode(msg.sender,price)) == listings[listingHash],"not owner / wrong price input");
        delete listings[listingHash];
        contracts[contractNo].transferFrom(address(this), msg.sender, tokenID);
        emit Unlisting(tokenID,price,contractNo,msg.sender);
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

