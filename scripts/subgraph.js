import * as fs from 'fs/promises';
import {CORE_CONTRACT_ADDRESS, START_BLOCK} from '@darkforest_eth/contracts'
import * as path from 'path'
main(process.argv[2],process.argv[3])
async function main(MARKET_CONTRACT_ADDRESS, MARKET_START_BLOCK){

    const newRoundadditon = `
  - kind: ethereum/contract
    name: MarketEvents
    network: xdai
    source:
      address: '{{{MARKET_CONTRACT_ADDRESS}}}'
      abi: MarketEvents
      startBlock: #{{{MARKET_START_BLOCK}}}
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.4
      language: wasm/assemblyscript
      file: ./src/mappingV2.ts
      entities:
        - CurrentListing
        - TokenSale
        - Artifact
      abis:
        - name: MarketEvents
          file: ./abis/MarketEvents.json
      eventHandlers:
        - event: Sale(indexed uint256,indexed address)
          handler: handleSale
        - event: Listed(indexed uint256,indexed uint256,indexed address)
          handler: handleListed
        - event: Unlisted(indexed uint256)
          handler: handleUnlisted
  - kind: ethereum/contract
    name: DarkForestCore
    network: xdai
    source:
      address: '{{{CORE_CONTRACT_ADDRESS}}}'
      abi: DarkForestCore
      startBlock: #{{{START_BLOCK}}}
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.5
      language: wasm/assemblyscript
      abis:
        - name: DarkForestCore
          file: '{{{CORE_ABI_PATH}}}'
        - name: DarkForestGetters
          file: '{{{GETTERS_ABI_PATH}}}'
      file: ./src/mapping.ts
    `

    const subgraphPath = '../subgraph';
    const abisPath =  ('./abis');
    const yaml = (await fs.readFile(path.join(subgraphPath, 'subgraph.yaml')))
      .toString()
      .concat(newRoundadditon)
      .replace(/{{{CORE_CONTRACT_ADDRESS}}}/g, CORE_CONTRACT_ADDRESS)
      .replace(/#{{{START_BLOCK}}}/g, START_BLOCK.toString())
      .replace(/{{{CORE_ABI_PATH}}}/g, path.join(abisPath, `DarkForestCore_stripped.json`))
      .replace(/{{{GETTERS_ABI_PATH}}}/g, path.join(abisPath, 'DarkForestGetters_stripped.json'))
      .replace(/{{{MARKET_CONTRACT_ADDRESS}}}/g, MARKET_CONTRACT_ADDRESS)
      .replace(/#{{{MARKET_START_BLOCK}}}/g, MARKET_START_BLOCK);

    await fs.writeFile(path.join(subgraphPath, 'subgraph.yaml'), yaml);
}