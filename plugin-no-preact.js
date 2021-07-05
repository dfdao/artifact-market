const { BigNumber, utils } = await import('https://cdn.skypack.dev/ethers'); // this is really slow to import 
const SALES_CONTRACT_ADDRESS = "0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8";
const TOKENS_CONTRACT_ADDRESS = "0xafb1A0C81c848Ad530766aD4BE2fdddC833e1e96";
const SALES_CONTRACT_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json').then(res=>res.json());
const TOKENS_APPROVAL_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/1cac7c4638ee5d766615afe4362e6ce80ed68067/APPROVAL_ABI.json').then(res=>res.json());
const SALES = await df.loadContract(SALES_CONTRACT_ADDRESS,SALES_CONTRACT_ABI);
const TOKENS = await df.loadContract(TOKENS_CONTRACT_ADDRESS,TOKENS_APPROVAL_ABI);
const DF_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/darkforest-eth/dark-forest-v06-round-2';
const MARKET_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/zk-farts/dfartifactmarket';


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
    for (const e of params.attributes){
      element.setAttribute(e[0], e[1])
    }
  }    
  if (params.eventListeners !== undefined){
      for (const e of params.eventListeners){
        element.addEventListener(e,params.eventListeners[e])
      }
    }
  if (params.css !== undefined){
    for (const e of params.css){
      element.style[e[0]] = e[1]
    }
  }
  return element
}


// from @darkforest-eth/types
const godGrammar = {
    god1: [
        "c'",
        'za',
        "ry'",
        "ab'",
        "bak'",
        "dt'",
        "ek'",
        "fah'",
        "q'",
        'qo',
        'van',
        'bow',
        'gui',
        'si',
    ],
    god2: [
        'thun',
        'tchalla',
        'thovo',
        'saron',
        'zoth',
        'sharrj',
        'thulu',
        'ra',
        'wer',
        'doin',
        'renstad',
        'nevere',
        'goth',
        'anton',
        'layton',
    ],
};
/**
 * Deterministically generates the name of the artifact from its ID.
 *
 * @param artifact The artifact to generate a name for
 */
 
function artifactNameFromArtifact(id) {
    const idNum = parseInt(id, 16);
    const roll1 = (idNum % 7919) % godGrammar.god1.length; // 7919 is a big prime
    const roll2 = (idNum % 7883) % godGrammar.god2.length; // 7883 is a big prime
    const name = godGrammar.god1[roll1] + godGrammar.god2[roll2];
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return nameCapitalized;
}


// fetch subgraph data for the tokens listed
// listings: the array of all listings
// fee: the fee (wei)
async function marketSubgraphData(){
  const res = await fetch(MARKET_GRAPH_URL,{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 
    ` 
      query getlistings{
        listings:  listedTokens(){
            tokenID
            price
        }
        
        fees(first:1 orderBy:id orderDirection:desc){
          fee
        }
      }
    `
      })
  })
  const text = await res.text()
  return JSON.parse(text,()=>{

  })
}


// The prices of each token. key = token, value= price (in XDAI)
//const prices = Map.fromEntries(marketSubgraphData.data.listings.map(e=>[e.tokenID,e.price]))
const prices = new Object()
const FEE =null
//console.log(FEE)

// fetch subgraph data for token stats
// returns object containing all the stats for every token owned by the current player OR the market contract
async function dfSubgraphData(){
  const res  = await fetch(DF_GRAPH_URL,{
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
        
        shopartifacts: artifacts(where:{owner:"${SALES_CONTRACT_ADDRESS.toLowerCase()}"}){
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
  const text = await res.text()
  return JSON.parse(text,(key,value)=>{
    if (typeof value === 'object' && value !== null){
      
    }
  })
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

    const onClick =(event)=>{
      SALES.list(BigNumber.from(artifact.idDec),utils.parseEther(value.toString())).then(res=>{
        event.target.parentNode.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode) 
        alert("listed!")
        console.log(res);
      }).catch(e=>console.log(e))
    }
    
    const onChange = (event)=>{
      console.log(event.target.value)
    }

    const row = document.createElement("tr")
    row.appendChild(createElement({type:"td", text:artifactNameFromArtifact(artifact.id) }))
    row.appendChild(createElement({type:"td", text:artifact.rarity }))
    row.appendChild(createElement({type:"td", text:artifact.artifactType }))
    row.appendChild(createElement({type:"td" }).appendChild(
      createElement({type:"div", text:"test"})
      ).parentNode.appendChild(
      createElement({type:"input", eventListeners:new Map([["change",onChange]]), attributes:(new Map([["type","number"],["min",0],["step",0.01],["size",4]]))})
      ).parentNode.appendChild(
      createElement({type:"button", eventListeners:new Map([["click",onClick]]), text:"List"})
    ))
}


// Creates one row in the table of the stores listed artifacts
function saleRow(artifact){ 
       
    const onClick = (event)=>{  
      SALES.buy(BigNumber.from(artifact.idDec)).then(res=>{
        event.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode)
        alert("bought!")
        console.log(res)
      }).catch(e=>console.log(e))
    }
    
    const row = document.createElement('tr').appendChild(
      createElement({type:"td", text:artifactNameFromArtifact(artifact.id) })).appendChild(
        (createElement({type:"div", text:`${artifact.rarity} ${artifact.artifactType}`,}))).parentNode.appendChild(
      createElement({type:"div", text:`
        ${formatMultiplier(artifact.energyCapMultiplier)}
        ${formatMultiplier(artifact.energyGrowthMultiplier)}
        ${formatMultiplier(artifact.rangeMultiplier)}
        ${formatMultiplier(artifact.speedMultiplier)}
        ${formatMultiplier(artifact.defenseMultiplier)}`,
        css: new Map([["fontSize","55%"]])})
      )
    
    row.appendChild(createElement({type:"td"})).appendChild(
      createElement({type:"div", text:`price: ${prices[artifact.idDec]} XDAI + ${FEE} fee`})
    ).parentNode.appendChild(
      createElement({type:"button", eventListeners:new Map([["click",onClick]]), text:"Buy"})
    )

    return row
}


// Creates the table of the users withdrawn artifacts
function myTable(){
  
  const div= document.createElement("div")
  div.appendChild(
    createElement({type:"table", css:new Map([["tableLayout","fixed"],["width","100%"]])})).appendChild(
      createElement({type:"caption",text:"My Artifacts"})).parentNode.appendChild(
      document.createElement('thead')).appendChild(
        document.createElement('tr')).appendChild(
          createElement({type:"th", text:"Artifact"})).parentNode.appendChild(
          createElement({type:"th", text:"Rarity"})).parentNode.appendChild(
          createElement({type:"th", text:"Type"})).parentNode.appendChild(
          createElement({type:"th", text:"Stats"})).parentNode.parentNode.appendChild(
      document.createElement('tbody'))
  
      dfSubgraphData.data.myartifacts.forEach(artifact=> body.appendChild(myRow(artifact)))  
  
  return div
}


// Creates the table of the stores listed artifacts
function saleTable(){
  
  const div= document.createElement("div")
  div.appendChild(
    createElement({type:"table", css:new Map([["tableLayout","fixed"],["width","100%"]])})).appendChild(
      createElement({type:"caption",text:"Store Artifacts"})).parentNode.appendChild(
      document.createElement('thead')).appendChild(
        document.createElement('tr')).appendChild(
          createElement({type:"th", text:"Artifact"})).parentNode.appendChild(
          createElement({type:"th", text:"Buy"}))
      const body = table.appendChild(document.createElement('tbody')) 
  
      dfSubgraphData.data.shopartifacts.forEach(artifact=> body.appendChild(saleRow(artifact)))  
  
  return div
}

function refreshButtons(){
  const refreshMine = ()=>{

  }
  const refreshStore = ()=>{

  }
  const div = document.createElement("div")
  div.appendChild(
    createElement({type:"button", text:"refresh my artifacts", eventListeners:new Map([["click",refreshMine]]), css:new Map([["float","right"]])}))
  div.appendChild(
    createElement({type:"button", text:"refresh store artifacts", eventListeners:new Map([["click",refreshStore]]), css:new Map([["float","right"]])}))
  return div
}


class Plugin {
  constructor() {
    this.container=null;
  }

  async render(container) {
    this.approval = localStorage.getItem("approval");  // Using localStorage means that we only ever have to approve the contract for tokens and xdai once 
    if (this.approval !== TOKENS_CONTRACT_ADDRESS){
        await TOKENS.setApprovalForAll(SALES_CONTRACT_ADDRESS,true).then(res=>{ // this will approve the market for all tokens
          console.log(res);
          localStorage.setItem("approval", TOKENS_CONTRACT_ADDRESS); // when a new round starts the TOKENS_CONTRACT_ADDRESS needs to get edited
        }).catch(e=>console.log(e));

    }
    this.container=container;
    this.container.style.width="400px"
    this.container.style.height="400px"
    this.container.appendChild(refreshButtons())
    this.container.appendChild(myTable())
    this.container.appendChild(saleTable())

  }

  destroy() {
    this.container = null;
  }
}


export default Plugin;
