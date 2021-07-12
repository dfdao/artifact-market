# Dark Forest Token Market

A plugin which allows darkforest players to sell their artifacts to each other in game.  
The contract should be able to get reused over multiple rounds  
Relies on [my subgraph](https://github.com/ZK-farts/DF-market-subgraph) and [the darkforest subgraph](https://github.com/darkforest-eth/eth/tree/master/subgraph) as well as obviously [Dark Forest](https://github.com/darkforest-eth).  

#  TODO (help appreciated)
 - The contract has an unlist function but there is no section for unlisting your own tokens from the plugin
 - If I add this section the code will get a lot longer so maybe change `myTable() myRow()` `saleTable() saleRow()` into one `makeTable() makeRow()`
 - Use images for the table categories instead of names 
 - Make the smart contract better (I think its fine now but if there are any problems I WILL redploy it)
 - Sortable Tables.
 - Make sure MANY tokens can display at once in UI
 - Better docs / comments
