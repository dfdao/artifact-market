import {html,useState,render} from 'https://unpkg.com/htm/preact/standalone.module.js';
const { BigNumber, utils } = await import('https://cdn.skypack.dev/ethers'); // this is really slow to import 
const WXDAI_CONTRACT_ADDRESS = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d";
const SALES_CONTRACT_ADDRESS = "0x678e993a531c8Fc93Ad4aeAEf099b0C16bA7058f";
const TOKENS_CONTRACT_ADDRESS = "0xafb1A0C81c848Ad530766aD4BE2fdddC833e1e96";
const SALES_CONTRACT_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/8ab45590ed73a45a8e850fa09635503713395cce/MARKET_ABI.json').then(res=>res.json());
const WXDAI_CONTRACT_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/531733e5ec6f09db3489d02fac6eeb10/raw/933c6beca511be1ae073f40d23068af2cdaf36b2/WXDAI_ABI.json').then(res=>res.json());
const TOKENS_APPROVAL_ABI = await fetch('https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/1cac7c4638ee5d766615afe4362e6ce80ed68067/APPROVAL_ABI.json').then(res=>res.json());
const WXDAI = await df.loadContract(WXDAI_CONTRACT_ADDRESS,WXDAI_CONTRACT_ABI);
const SALES = await df.loadContract(SALES_CONTRACT_ADDRESS,SALES_CONTRACT_ABI);
const TOKENS = await df.loadContract(TOKENS_CONTRACT_ADDRESS,TOKENS_APPROVAL_ABI);
const DF_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/darkforest-eth/dark-forest-v06-round-2';
const MARKET_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/zk-farts/dfartifactmarket';


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


//fetch subgraph data for the tokens listed
const marketSubgraphData = await fetch(MARKET_GRAPH_URL,{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 
    ` 
      query getlistings{
        listings:  listedTokens{
            tokenID
            price
        }
      }
`
      })
})
.then((response)=> response.json());

// the prices of each token
const prices = Object.fromEntries(marketSubgraphData.data.listings.map(e=>[e.tokenID,e.price]))

//fetch subgraph data for token stats
const dfSubgraphData = await fetch(DF_GRAPH_URL,{
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
.then((response)=> response.json());


// Creates one row in the table of the users withdrawn artifacts
function myRow(artifact){
    const [value, setValue] = useState(0);
    
    const onClick =()=>{
        SALES.list(BigNumber.from(artifact.idDec),utils.parseEther(value.toString())).then(res=>console.log(res)).catch(e=>console.log(e))
    };
    
    const capmul = artifact.energyCapMultiplier
    const growmul = artifact.energyGrowthMultiplier
    const rangemul = artifact.rangeMultiplier
    const speedmul = artifact.speedMultiplier
    const defmul = artifact.defenseMultiplier
    
    return html`
       <tr>
        <td>${artifactNameFromArtifact(artifact.id)}</td>
        <td>${artifact.rarity}</td>
        <td>${artifact.artifactType}</td>
        <td>
          <div style="font-size:60%">${capmul} ${growmul} ${rangemul} ${speedmul} ${defmul}</div>
          <input type=number min=0 step=0.01 size=4></input>
          <div><button onclick=${onClick}>list</button></div>
        </td>
      </tr>        
    `
}


// Creates one row in the table of the stores listed artifacts
function saleRow(artifact){ 
       
    const buyClick = ()=>{  
        SALES.buy(BigNumber.from(artifact.idDec)).then(res=>console.log(res)).catch(e=>console.log(e))
    }

    const capmul = artifact.energyCapMultiplier
    const growmul = artifact.energyGrowthMultiplier
    const rangemul = artifact. rangeMultiplier
    const speedmul = artifact.speedMultiplier
    const defmul = artifact.defenseMultiplier
    
    return html`
        <tr>
          <td>
            <div>${artifact.rarity} ${artifact.artifactType}</div>
            <div style="font-size:55%">${capmul} ${growmul} ${rangemul} ${speedmul} ${defmul}</div>
          </td>
          <td>
            <div style="margin:auto">
              price: ${prices[artifact.idDec]} WXDAI + fee
            </div>
            <button onClick=${buyClick}>Buy</button>
          </td>
        </tr>
      `
}


// Creates the table of the users withdrawn artifacts
function myTable(){
  return html`
    <div style="max-height:33%" overflow=scroll>
    <table>
      <caption>My Artifacts</caption>
      <thead>
        <tr>
          <th>Artifact </th>
          <th>Rarity</th>
          <th>Type</th>
          <th>Stats</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(dfSubgraphData.data.myartifacts).map((artifact) =>{return myRow(artifact)})}
      </tbody>
    </table>
    </div>
  `
}


// Creates the table of the stores listed artifacts
function saleTable(){
  return html`
    <div style="max-height:33%" overflow=scroll>
    <table>
      <caption>Store Artifacts</caption>
      <thead>
        <tr>
          <th>Artifact</th>
          <th>Buy</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(dfSubgraphData.data.shopartifacts).map((artifact) =>{return saleRow(artifact)})}
      </tbody>
    </table>
    </div>
  `
}


// part where you can wrap xdai
function wrapPart() {
  const [value, setValue] = useState(Math.round(df.balance/2));
    
  function Wrap(){
    let bignum = utils.parseEther(value.toString())
    WXDAI.deposit({value: bignum, gasPrice: BigNumber.from(11000000000)}).then((x)=>{console.log(x); alert(`wrapped ${value}`)}).catch((e)=>{alert`tx fail ${e}`})
  };

  function Unwrap(){
    let bignum = utils.parseEther(value.toString())
    WXDAI.withdraw(bignum, {gasPrice: BigNumber.from(11000000000)}).then((x)=>{console.log(x); alert(`unwrapped ${value}`)}).catch((e)=>{alert`tx fail ${e}`})
  };

  const onChange = (event) => {
    setValue(event.target.value);
  };
    
    return html`
        <div style="text-align:center">Wrap XDAI: ${value}</div>
          <div style="text-align:center">
          <input type='number' step="0.01" min=0 max=${df.balance}  value=${value} onChange=${onChange} />
          <button style="float:right" onClick=${Unwrap}>unwrap</button>
          <button style="float:right" onClick=${Wrap}>wrap</button>
        </div>`
}


// the main part of the app + some styling
function App() {

  return (
      html`
        <style>
          table {table-layout:fixed; width:100%; border:2px solid white;}
          td {text-align:center}
          input {border:1px solid white; border-radius:4px; background-color:#080808}
        </style>
        <${wrapPart} />
        <${myTable} />
        <${saleTable} />
    `
  );
}



class Plugin {
  constructor() {
    this.container=null;
    this.root=null;
  }

  async render(container) {
    this.approval = localStorage.getItem("approval");  // Using localStorage means that we only ever have to approve the contract for tokens and xdai once 
    if (this.approval != SALES_CONTRACT_ADDRESS){
        await TOKENS.setApprovalForAll(SALES_CONTRACT_ADDRESS,true).then(res=>console.log(res)).catch(e=>console.log(e));
        await WXDAI.approve(SALES_CONTRACT_ADDRESS,utils.parseEther("100000")).then(res=>{  // 100 thousand xdai spent by one person on aritfacts seems impossibly high
            console.log(res)
            localStorage.setItem("approval", SALES_CONTRACT_ADDRESS)}).catch(e=>console.log(e));
    }
    this.container=container;
    this.container.style.width="400px"
    this.container.style.height="400px"
    this.root = render(html`<${App} />`, container)
  }

  destroy() {
    render(null, this.container, this.root)
  }
}


export default Plugin;