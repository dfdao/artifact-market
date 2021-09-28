# Artifact Market

Buy and sell artifacts in [Dark Forest](https://zkga.me) with the Artifact Market plugin.

![Dark Forest Artifact Market Plugin](https://darkforest.market/artifact-market.png)

## Features

- Buy, list and withdraw your artifacts on the marketplace
- Search to filter artifacts by name and rarity
- Sort lists by clicking the header icons

## Installation

Create a new plugin and add the following code:

```js
export { default } from "https://darkforest.market/plugin.js";
```

## Resources

- website [darkforest.market](https://darkforest.market)
- verified contract [CHANGETHIS](https://blockscout.com/xdai/mainnet/address/CHANGETHIS)
- github [github.com/dfdao/artifact-market](https://github.com/dfdao/artifact-market)
- issues [github.com/dfdao/artifact-market/issues](https://github.com/dfdao/artifact-market/issues)
- twitter [twitter.com/d_fdao](https://twitter.com/d_fdao)

## Warning

The smart contract written for this marketplace has not been audited, use at your own risk.

## Danger

Plugins are evaluated in the context of your game and can access all of your private information (including private key!). Plugins can dynamically load data, which can be switched out from under you!!! Use these plugins at your own risk.

You should not use any plugins that you haven't written yourself or by someone you trust completely. You or someone you trust should control the entire pipeline (such as imported dependencies) and should review plugins before you use them.
