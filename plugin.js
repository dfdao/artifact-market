import { BigNumber, utils } from 'https://cdn.skypack.dev/ethers';
const SALES_CONTRACT_ADDRESS = "0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8";
const SALES_CONTRACT_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json').then(res=>res.json());
const SALES = await df.loadContract(SALES_CONTRACT_ADDRESS,SALES_CONTRACT_ABI);
const DF_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/darkforest-eth/dark-forest-v06-round-2';
const MARKET_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/zk-farts/dfartifactmarket';
const TOKENS_CONTRACT_ADDRESS = "0xafb1A0C81c848Ad530766aD4BE2fdddC833e1e96"; // when a new round starts someone has to change this
const TOKENS_APPROVAL_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/1cac7c4638ee5d766615afe4362e6ce80ed68067/APPROVAL_ABI.json').then(res=>res.json());
const TOKENS = await df.loadContract(TOKENS_CONTRACT_ADDRESS,TOKENS_APPROVAL_ABI);  
const FEE = "5000000000000000" 

/*
  createElement function: this lets me make elements more easily
    @params params: Object containing 5 entries :TODO maybe a Map is faster
        params.type: The kind of element to create (string)
        params.attributes: a Map containing all the attributes. key = attribute, value = value
        params.text: The text of the element
        params.eventListeners: The event listeners (onclick, onchange,)
        parms.css: a Map containing the style parts as key and the value to assign as value
*/
function createElement(params){
  const element = document.createElement(params.type)
  element.textContent = params.text
  if ( params.attributes !== undefined){
    for (const [key,value] of params.attributes){
      element.setAttribute(key, value)
    }
  }    
  if (params.eventListeners !== undefined){
    for (const [key,value] of params.eventListeners){
      element.addEventListener(key,value)
    }
  }
  if (params.css !== undefined){
    for (const e of params.css){
      element.style[e[0]] = e[1]
    }
  }
  return element
}



// fetch subgraph data for token stats and prices
// returns object containing all the stats for every token owned by the current player and the market contract with prices for listed ones
async function subgraphData(){
  const tokens  = await fetch(DF_GRAPH_URL,{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 
    ` 
      query getartifacts{
        myartifacts: artifacts(where:{owner:"${df.account}"}){
          idDec
          id
          rarity
          artifactType
          energyCapMultiplier
          energyGrowthMultiplier
          rangeMultiplier
          speedMultiplier
          defenseMultiplier
        }
        
        shopartifacts: artifacts(orderBy: idDec orderDirection: asc where:{owner:"${SALES_CONTRACT_ADDRESS.toLowerCase()}"}){
          idDec
          id
          rarity
          artifactType
          energyCapMultiplier
          energyGrowthMultiplier
          rangeMultiplier
          speedMultiplier
          defenseMultiplier
        }
      }
    `
      })
  })
  
  const prices = await fetch(MARKET_GRAPH_URL,{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        query: 
        ` 
        query getlistings{
            prices: listedTokens(orderBy: tokenID orderDirection: asc){
                tokenID
                price
            }
        }
        `
    })
  })
  const tokensObject = await tokens.json()
  const pricesArray = (await prices.json()).data.prices
  
  // this relies on both the subgraphs working properly or else the prices will get displayed incorrectly, maybe change that?
  for (let i =0; i<pricesArray.length; i++){
    tokensObject.data.shopartifacts[i].price = pricesArray[i].price
  }
  return tokensObject.data
}


// function for properly formatting the artifacts stats
function formatMultiplier(mul){
    if (mul ==100){
      return `+0%`
    }        
    else if (mul <100){
      return  `-${100 -mul}%`            
    }
      return `+${mul-100}%`
  }

// Creates one row in the table of the users withdrawn artifacts
function myRow(artifact){
    let value;
    const onClick =(event)=>{
      SALES.list(BigNumber.from(artifact.idDec),utils.parseEther(value.toString())).then(()=>{
        event.target.parentNode.parentNode.parentNode.parentNode.removeChild(event.target.parentNode.parentNode.parentNode)  // delete the row
        alert("listed!")
      }).catch(e=>console.log(e))
    }
    
    const onChange = (event)=>{
       value = event.target.value
    }

    const row = document.createElement("tr")
    row.appendChild(createElement({type:"td", text:`${artifact.rarity} ${artifact.artifactType}` }))
    row.appendChild(createElement({type:"td"})).appendChild(
      createElement({type:"div", text:`
        ${formatMultiplier(artifact.energyCapMultiplier)}
        ${formatMultiplier(artifact.energyGrowthMultiplier)}
        ${formatMultiplier(artifact.rangeMultiplier)}
        ${formatMultiplier(artifact.speedMultiplier)}
        ${formatMultiplier(artifact.defenseMultiplier)}`,
        css: new Map([["fontSize","65%"]])})
      )
    row.appendChild(createElement({type:"td" })).appendChild(document.createElement("div")).appendChild(
      createElement({type:"input", eventListeners:new Map([["change",onChange]]), css:new Map([["border","1px solid white"],["backgroundColor","#080808"]]), attributes:(new Map([["type","number"],["min",0],["step",0.01],["size",4]]))})
      ).parentNode.appendChild(
      createElement({type:"button", eventListeners:new Map([["click",onClick]]), text:"List"}))
    
  return row
}


// Creates one row in the table of the stores listed artifacts
function saleRow(artifact){ 
    
    const onClick = (event)=>{  
      SALES.buy(BigNumber.from(artifact.idDec),{value: BigNumber.from(artifact.price).add(BigNumber.from(FEE))}).then(()=>{
        event.target.parentNode.parentNode.parentNode.removeChild(event.target.parentNode.parentNode) // delete the row
        alert("bought!")
      }).catch(e=>console.log(e))
    }
    
    const row = document.createElement('tr')
    row.appendChild(
      createElement({type:"td", text:artifactNameFromArtifact(artifact.id) })).appendChild(
        (createElement({type:"div", text:`${artifact.rarity} ${artifact.artifactType}`,}))).parentNode.appendChild(
      createElement({type:"div", text:`
        ${formatMultiplier(artifact.energyCapMultiplier)}
        ${formatMultiplier(artifact.energyGrowthMultiplier)}
        ${formatMultiplier(artifact.rangeMultiplier)}
        ${formatMultiplier(artifact.speedMultiplier)}
        ${formatMultiplier(artifact.defenseMultiplier)}`,
        css: new Map([["fontSize","65%"]])})
      )
    
    row.appendChild(createElement({type:"td"})).appendChild(
      createElement({type:"div", text:`price: ${utils.formatEther(artifact.price)} XDAI + ${utils.formatEther(FEE)} fee`})
    ).parentNode.appendChild(
      createElement({type:"button",text:"Buy", eventListeners:new Map([["click",onClick]]) })
    )

    return row
}


// Creates the table of the users withdrawn artifacts
function myTable(data){

    const table = createElement({type:"table", css:new Map([["tableLayout","fixed"],["width","100%"]])})
    table.appendChild(
      createElement({type:"caption",text:"My Artifacts"}))
    table.appendChild(
      document.createElement('thead')).appendChild(
        document.createElement('tr')).appendChild(
          createElement({type:"th", text:"Artifact"})).parentNode.appendChild(
          createElement({type:"th", text:"Stats"})).parentNode.appendChild(
          createElement({type:"th", text:"List"}))
    if (data !== null){
      const body = table.appendChild(document.createElement('tbody'))
      for (let artifact of data.myartifacts){
        body.appendChild(myRow(artifact)) 
      } 
    }
    return table
}


// Creates the table of the stores listed artifacts
function saleTable(data){
  
  const table= createElement({type:"table", css:new Map([["tableLayout","fixed"],["width","100%"]])})
  table.appendChild(
      createElement({type:"caption",text:"Store Artifacts"}))
  table.appendChild(
      document.createElement('thead')).appendChild(
        document.createElement('tr')).appendChild(
          createElement({type:"th", text:"Artifact"})).parentNode.appendChild(
          createElement({type:"th", text:"Stats"})).parentNode.appendChild(
          createElement({type:"th", text:"Buy"}))
  if (data !== null){
    const body = table.appendChild(document.createElement('tbody'))
    for (let artifact of data.shopartifacts){
      body.appendChild(saleRow(artifact)) 
    } 
  }
  return table
}

// special buttons for approving the contract and if I can figure out refreshing it goes here too
// I assume that re-rendering the whole thing would be async 
async function specialButtons(){
  const approve = ()=> {
    TOKENS.setApprovalForAll(SALES_CONTRACT_ADDRESS,true).catch(e=>console.log(e)) // this will approve the market for all tokens
  }

  const div = document.createElement('div')
  div.appendChild(createElement({type:"button", text:"approve", css:new Map([["float","right"]]), eventListeners:new Map([["click",approve]])}))
  return div
}

class Plugin {
  constructor() {
    this.container=null;
    this.TOKENS = null
  }

  async render(container) {
    const data=await subgraphData()
    this.container=container;
    this.container.style.width="400px"
    this.container.style.height="400px"
    this.container.appendChild(await specialButtons())
    this.container.appendChild(myTable(data))
    this.container.appendChild(saleTable(data))

  }

  destroy() {
    this.container = null;
  }
}


export default Plugin;
