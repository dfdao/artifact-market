# Dark Forest Token Market
## NEEDS THE SUBGRAPH WORKING FIRST BEFOE I FINISH THIS!!!!!!!!!   
A plugin which allows darkforest players to sell their artifacts to each other in game.  
The contract should be able to get reused over multiple rounds  
Relies on [my subgraph](https://github.com/ZK-farts/DF-market-subgraph) and [the darkforest subgraph](https://github.com/darkforest-eth/eth/tree/master/subgraph) as well as obviously [Dark Forest](https://github.com/darkforest-eth).  
#  TODO (help appreciated)

 -  Make the smart contract better (I think its fine now)
 -  Sortable Tables.
 - Make sure many tokens can display at once in UI
 - UI should refresh when you buy or sell a token (if re-fetching subgraph is fast enough) // should have a refresh button
 - Better docs / comments
 - Maybe remake the whole frontend (its slow)  DONE but still slow because of import ethers.js

# thoughts
could remove events entirely and just use the subgraph to track calls (would save some gas for users) **DONE** 
probably would be easier to just transfer xdai instead of wxdai? **DONE**  
what would I do if darkforest moves to another chain?  

