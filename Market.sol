//SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.4;

interface IWXDAI{
    function deposit() external payable;
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function withdraw(uint256) external;
    function balanceOf(address) external view returns (uint256);
}

interface DarkForestTokens{
    function transferFrom(address from, address to, uint256 tokenID) external;
}


contract Market {
    
    event ListingUpdate(uint256 indexed token, uint256 indexed price);
    
    struct Listing{
        address owner;       // who owns the listed artifact
        uint256 buyoutPrice; // buy out price, any bid greater will buy the artifact instantly
    }

    IWXDAI public constant WXDAI = IWXDAI(0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d);
    address public admin;
    uint256 public endDate;
    uint256 public fee;
    mapping(uint256 => Listing) public listings; // all listings 
    
    DarkForestTokens private DFTokens; 
        
    constructor(address tokensAddress, uint256 date, uint256 _fee){
        admin = msg.sender; // fee reciever
        DFTokens = DarkForestTokens(tokensAddress);  
        endDate = date;
        fee = _fee; // flat fee on each listing: probably set this to a couple cents?
    }

    function list(uint256 tokenID, uint256 price) external {
        
        listings[tokenID] = Listing({
            owner: msg.sender,
            buyoutPrice: price
        });
        
        emit ListingUpdate(tokenID,price);
        DFTokens.transferFrom(msg.sender, address(this), tokenID);        
    }

    // buying function. User input is the price they pay BEFORE fee
    function buy(uint256 tokenID) external  {
        Listing memory oldListing = listings[tokenID];
        
        listings[tokenID]= Listing({
            owner: address(0),
            buyoutPrice: 0
        });
        
        emit ListingUpdate(tokenID,0);
        require (WXDAI.transferFrom(msg.sender, address(this), value+fee));
        require (WXDAI.transfer(oldListing.owner, oldListing.buyoutPrice));
        DFTokens.transferFrom(address(this), msg.sender, tokenID);
    }
    
    
    function unlist (uint256 id) external{
        address holder = listings[id].owner;
        require(msg.sender == holder);
        
        listings[id]= Listing({
            owner: address(0),
            buyoutPrice: 0
        });
        
        emit ListingUpdate(id,0);
        DFTokens.transferFrom(address(this), holder, id);
    }


    
    //ADMIN FUNCTIONS
    function newRound(uint256 date, address tokens) external{
        require(block.timestamp>endDate,"too early");
        require(msg.sender == admin, "admin function only");
        endDate = date;
        DFTokens = DarkForestTokens(tokens);
    }

    function collectFees() external{
        require(block.timestamp>endDate,"too early");
        require(msg.sender == admin, "admin function only");
        WXDAI.transfer(admin, WXDAI.balanceOf(address(this)) );
    }
    
    function changeFee(uint256 newFee) external{
        require (fee <= 1 ether,"don't be greedy!"); // on xdai '1 ether' = 1 XDAI
        fee = newFee;
    }

}

