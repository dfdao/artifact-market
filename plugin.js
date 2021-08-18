import { BigNumber, utils } from "https://cdn.skypack.dev/ethers";
import {
  html,
  render,
  useState,
  useEffect,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import {
  ArtifactRarity,
  ArtifactType,
  ArtifactTypeNames,
} from "http://cdn.skypack.dev/@darkforest_eth/types";

const DF_GRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/darkforest-eth/dark-forest-v06-round-2";
const MARKET_GRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/zk-farts/dfartifactmarket";

// you can see the contract at https://blockscout.com/poa/xdai/address/0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8
const SALES_CONTRACT_ADDRESS = "0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8";
const SALES_CONTRACT_ABI = await fetch(
  "https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json"
).then((res) => res.json());
const SALES = await df.loadContract(SALES_CONTRACT_ADDRESS, SALES_CONTRACT_ABI);

const TOKENS_CONTRACT_ADDRESS = "0xafb1A0C81c848Ad530766aD4BE2fdddC833e1e96"; // when a new round starts someone has to change this
const TOKENS_APPROVAL_ABI = await fetch(
  "https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/1cac7c4638ee5d766615afe4362e6ce80ed68067/APPROVAL_ABI.json"
).then((res) => res.json());
const TOKENS = await df.loadContract(
  TOKENS_CONTRACT_ADDRESS,
  TOKENS_APPROVAL_ABI
);

// Dark Forest Helpers - ideally these would be imported from cdn

const Colors = {
  green: "#00dc82",
  red: "#ff6492",
  muted: "#838383",
};

// https://github.com/darkforest-eth/client/blob/00492e06b8acf378e7dacc1c02b8ede61481bba3/src/Frontend/Styles/Colors.tsx
const RarityColors = {
  [ArtifactRarity.Unknown]: "#000000",
  [ArtifactRarity.Common]: Colors.muted,
  [ArtifactRarity.Rare]: "#6b68ff",
  [ArtifactRarity.Epic]: "#c13cff",
  [ArtifactRarity.Legendary]: "#f8b73e",
  [ArtifactRarity.Mythic]: "#ff44b7",
};

class Plugin {
  constructor() {
    this.container = null;
  }

  render(container) {
    this.container = container;
    this.container.style.width = "512px";
    this.container.style.height = "384px";
    this.container.style.padding = 0;
    render(html`<${App} />`, container);
  }

  destroy() {
    render(null, this.container);
  }
}

// convert key to match df format, return color
function rarityColor(key) {
  const rarity = key[0] + key.toLowerCase().slice(1, key.length); // COMMON => Common
  const rarityId = ArtifactRarity[rarity];
  return RarityColors[rarityId];
}

// convert uppercase artifactType to properly formatted name
function artifactName(name) {
  const typeID = Object.keys(ArtifactType).find(
    (key) => key.toUpperCase() === name
  );
  const artifactId = ArtifactType[typeID];
  return ArtifactTypeNames[artifactId];
}

function App() {
  return html`<${Market} />`;
}

function Market() {
  const { data, loading, error } = useSubgraph();
  console.log(data, loading, error);

  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px 16px",
    gridRowGap: "16px",
  };

  if (loading) return html`<${Loading} />`;

  if (error)
    return html`
      <div>
        <h1>Something went wrong...</h1>
        <p>${JSON.stringify(error, null, 2)}</p>
      </div>
    `;

  return html`
    <div style=${artifactsStyle}>
      <${Artifacts}
        title="Your Artifacts"
        empty="You don't currently have any artifacts."
        action="List"
        artifacts=${data.artifactsOwned}
      />
      <${Artifacts}
        title="Your Listed Artifacts"
        empty="You don't currently have any artifacts listed."
        artifacts=${data.artifactsListed}
      />
      <${Artifacts}
        title="Artifacts For Sale"
        empty="There aren't currently any artifacts listed for sale."
        action="Buy"
        price="1.0"
        artifacts=${data.artifactsForSale}
      />
    </div>
  `;
}

function Loading() {
  const loadingStyle = {
    display: "grid",
    width: "100%",
    minHeight: "100%",
    placeContent: "center",
  };

  return html`
    <div style=${loadingStyle}>
      <span class="Wrap-sc-1ehljia yxLrH">
        <span class="Static-sc-1sdikul daiCTc">Loading</span>
        <span class="Anim-sc-1s9k1th cicvbr">
          <span class="AnimDelay-sc-170sl4v kzVTlq">L</span>
          <span class="AnimDelay-sc-170sl4v cTQehp">o</span>
          <span class="AnimDelay-sc-170sl4v gVukkp">a</span>
          <span class="AnimDelay-sc-170sl4v gHvIwK">d</span>
          <span class="AnimDelay-sc-170sl4v brzOHe">i</span>
          <span class="AnimDelay-sc-170sl4v bYMvlb">n</span>
          <span class="AnimDelay-sc-170sl4v efJVaj">g</span>
          <span class="AnimDelay-sc-170sl4v ihobdj">.</span>
          <span class="AnimDelay-sc-170sl4v fvBRDQ">.</span>
          <span class="AnimDelay-sc-170sl4v fFXOk">.</span>
        </span>
      </span>
    </div>
  `;
}

function Artifacts({ title, empty, artifacts = [], price, action }) {
  const artifactsStyle = {
    display: "grid",
    gridRowGap: "4px",
  };

  const emptyStyle = {
    color: "#838383",
  };

  const artifactsChildren = artifacts.length
    ? artifacts.map(
        (artifact) =>
          html`<${Artifact}
            key=${artifact.id}
            artifact=${artifact}
            price=${price}
            action=${action}
          />`
      )
    : html`<p style=${emptyStyle}>${empty}</p>`;

  return html`
    <div>
      <h1>${title}</h1>
      <div style=${artifactsStyle}>${artifactsChildren}</div>
    </div>
  `;
}

function Artifact({ artifact, price, action }) {
  const artifactStyle = {
    display: "grid",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
    textAlign: "right",
  };

  const artifactTypeStyle = {
    color: rarityColor(artifact.rarity),
    textAlign: "left",
  };

  const inputStyle = {
    outline: "none",
    background: "rgb(21, 21, 21)",
    color: "rgb(131, 131, 131)",
    borderRadius: "4px",
    border: "1px solid rgb(95, 95, 95)",
    width: 42,
    padding: "0 2px",
    "::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "::-webkit-inner-spin-button": {},
    "[type=number]": {
      "-moz-appearance": "textfield",
    },
  };

  const buttonStyle = {
    border: 0,
    width: 42,
    background: "#5f5f5f",
  };

  const InputMockup = () => {
    if (price)
      return html`
        <div>
          <p>$${price}</p>
        </div>
      `;

    return html`
      <div>
        <input style=${inputStyle} type="number" step="0.01" min="0.01" />
      </div>
    `;
  };

  return html`
    <div style=${artifactStyle}>
      <div style=${artifactTypeStyle}>
        ${artifactName(artifact.artifactType)}
      </div>
      <div
        style=${{ color: formatMultiplierColor(artifact.energyCapMultiplier) }}
      >
        ${formatMultiplier(artifact.energyCapMultiplier)}
      </div>
      <div
        style=${{
          color: formatMultiplierColor(artifact.energyGrowthMultiplier),
        }}
      >
        ${formatMultiplier(artifact.energyGrowthMultiplier)}
      </div>
      <div style=${{ color: formatMultiplierColor(artifact.rangeMultiplier) }}>
        ${formatMultiplier(artifact.rangeMultiplier)}
      </div>
      <div style=${{ color: formatMultiplierColor(artifact.speedMultiplier) }}>
        ${formatMultiplier(artifact.speedMultiplier)}
      </div>
      <div
        style=${{ color: formatMultiplierColor(artifact.defenseMultiplier) }}
      >
        ${formatMultiplier(artifact.defenseMultiplier)}
      </div>
      <${InputMockup} price=${price} />
      <div><button style=${buttonStyle}>${action}</button></div>
    </div>
  `;
}

// fetch subgraph data for token stats and prices
// 1 problem with this: we can only see ~100 listed tokens and 100 tokens owned by the player
function useSubgraph() {
  const [listings, setListings] = useState(null);
  const [artifacts, setArtifacts] = useState(null);
  const [listingsError, setListingsError] = useState(null);
  const [artifactsError, setArtifactsError] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [artifactsLoading, setArtifactsLoading] = useState(true);

  useEffect(() => {
    fetchListings()
      .then((res) => res.json())
      .then((json) => setListings(json.data))
      .then(() => setListingsLoading(false))
      .catch(setListingsError);
  }, []);

  useEffect(() => {
    fetchArtifacts()
      .then((res) => res.json())
      .then((json) => setArtifacts(json.data))
      .then(() => setArtifactsLoading(false))
      .catch(setArtifactsError);
  }, []);

  // change from array of objects with 1 element(tokenID) to array of tokenID
  const artifactsListedIds = listings?.mytokens.map((e) => e.tokenID) ?? "";
  const includesToken = (token) => artifactsListedIds.includes(token.idDec);
  const excludesToken = (token) => !includesToken(token);
  const withPrice = (token, i) => {
    // TODO: I need to make sure they are sorted the same way or else this won't work
    const price = listings?.othertokens[i].price;
    return { ...token, price };
  };

  return {
    data: {
      artifactsOwned: artifacts?.myartifacts,
      artifactsListed: artifacts?.shopartifacts.filter(includesToken),
      artifactsForSale: artifacts?.shopartifacts
        .filter(excludesToken)
        .map(withPrice),
    },
    loading: listingsLoading || artifactsLoading,
    error: listingsError || artifactsError,
  };
}

function fetchListings() {
  // gets from shop subgraph
  return fetch(MARKET_GRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ` 
        query getlistings{
          othertokens: listedTokens( where:{owner_not: "${df.account}"}){
            tokenID
            price
          }
          mytokens: listedTokens( where:{owner: "${df.account}"}){
            tokenID
          }
        }
        `,
    }),
  });
}

function fetchArtifacts() {
  // gets from df subgraph
  return fetch(DF_GRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ` 
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
    `,
    }),
  });
}

// function for properly formatting the artifacts stats
function formatMultiplier(value) {
  if (value === 100) return `+0%`;
  if (value > 100) return `+${value - 100}%`;
  return `-${100 - value}%`;
}

function formatMultiplierColor(value) {
  if (value === 100) return Colors.muted;
  if (value > 100) return Colors.green;
  return Colors.red;
}

function myListedRow(artifact) {
  const onClick = (event) => {
    SALES.unlist(BigNumber.from(artifact.idDec))
      .then(() => {
        // unlist the token
        event.target.parentNode.parentNode.parentNode.parentNode.removeChild(
          event.target.parentNode.parentNode.parentNode
        ); // delete the row
        alert("unlisted!");
      })
      .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  };

  const row = document.createElement("tr");
  row.appendChild(
    createElement({
      type: "td",
      text: `${artifact.rarity} ${artifact.artifactType}`,
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyCapMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyGrowthMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.rangeMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.speedMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.defenseMultiplier),
    })
  );
  row.appendChild(createElement({ type: "td" })).appendChild(
    createElement({
      type: "button",
      text: "Unlist",
      eventListeners: [["click", onClick]],
    })
  );
  return row;
}

// Creates one row in the table of the users withdrawn artifacts
function myRow(artifact) {
  let value; //  the price at which the token will be listed at
  const onClick = (event) => {
    SALES.list(
      BigNumber.from(artifact.idDec),
      utils.parseEther(value.toString())
    )
      .then(() => {
        // list the token for the price that was input
        event.target.parentNode.parentNode.parentNode.parentNode.removeChild(
          event.target.parentNode.parentNode.parentNode
        ); // delete the row
        alert("listed!");
      })
      .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  };

  const onChange = (event) => {
    // function to handle when the input value gets changed
    value = event.target.value;
  };

  const row = document.createElement("tr");
  row.appendChild(
    createElement({
      type: "td",
      text: `${artifact.rarity} ${artifact.artifactType}`,
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyCapMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyGrowthMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.rangeMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.speedMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.defenseMultiplier),
    })
  );
  row
    .appendChild(createElement({ type: "td" }))
    .appendChild(document.createElement("div"))
    .appendChild(
      createElement({
        type: "input",
        eventListeners: [["change", onChange]],
        attributes: [
          ["type", "number"],
          ["min", 0],
          ["step", 0.01],
          ["size", 4],
        ],
      })
    )
    .parentNode.appendChild(
      createElement({
        type: "button",
        eventListeners: [["click", onClick]],
        text: "List",
      })
    );

  return row;
}

// Creates one row in the table of the stores listed artifacts
function saleRow(artifact) {
  const onClick = (event) => {
    SALES.buy(BigNumber.from(artifact.idDec), {
      value: BigNumber.from(artifact.price),
    })
      .then(() => {
        // buys the artifact
        event.target.parentNode.parentNode.parentNode.removeChild(
          event.target.parentNode.parentNode
        ); // delete the row
        alert("bought!");
      })
      .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  };
  const row = document.createElement("tr");
  row.appendChild(
    createElement({
      type: "td",
      text: `${artifact.rarity} ${artifact.artifactType}`,
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyCapMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.energyGrowthMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.rangeMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.speedMultiplier),
    })
  );
  row.appendChild(
    createElement({
      type: "td",
      text: formatMultiplier(artifact.defenseMultiplier),
    })
  );
  row
    .appendChild(createElement({ type: "td" }))
    .appendChild(
      createElement({
        type: "div",
        text: `price: ${utils.formatEther(artifact.price)} XDAI`,
        css: [["fontSize", "70%"]],
      })
    )
    .parentNode.appendChild(
      createElement({
        type: "button",
        text: "Buy",
        eventListeners: [["click", onClick]],
      })
    );

  return row;
}

// Creates the table of the users withdrawn artifacts
// TODO: this should have a fixed size and any columns that do not fit should be viewable by scrolling
function myTable(data) {
  const table = document.createElement("table");
  table.appendChild(createElement({ type: "caption", text: "My Artifacts" }));
  table
    .appendChild(document.createElement("thead"))
    .appendChild(document.createElement("tr"))
    .appendChild(createElement({ type: "th", text: "Artifact" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Cap" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Growth" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Range" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Speed" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Defense" }))
    .parentNode.appendChild(createElement({ type: "th", text: "List" }));

  if (data) {
    // pretty sure I don't need to do this check
    const footer = table.appendChild(document.createElement("tfoot"));
    footer.appendChild(document.createElement("tr")).appendChild(
      createElement({
        type: "th",
        text: "My listings",
        attributes: [["colspan", 7]],
      })
    );

    const body = table.appendChild(document.createElement("tbody"));
    for (let artifact of data.myartifacts) {
      body.appendChild(myRow(artifact));
    }
    for (let artifact of data.mylistedartifacts) {
      footer.appendChild(myListedRow(artifact));
    }
  }
  return table;
}

// Creates the table of the stores listed artifacts
// TODO: this should have a fixed size and any columns that do not fit should be viewable by scrolling
function saleTable(data) {
  const table = document.createElement("table");
  table.appendChild(
    createElement({ type: "caption", text: "Store Artifacts" })
  );
  table
    .appendChild(document.createElement("thead"))
    .appendChild(document.createElement("tr"))
    .appendChild(createElement({ type: "th", text: "Artifact" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Cap" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Growth" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Range" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Speed" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Defense" }))
    .parentNode.appendChild(createElement({ type: "th", text: "Buy" }));
  if (data) {
    // pretty sure I don't need to do this check
    const body = table.appendChild(document.createElement("tbody"));
    for (let artifact of data.shopartifacts) {
      body.appendChild(saleRow(artifact));
    }
  }
  return table;
}

// special buttons for approving the contract and refreshing

async function specialButtons(container, plugin) {
  const approve = () => {
    TOKENS.setApprovalForAll(SALES_CONTRACT_ADDRESS, true).catch((e) =>
      console.log(e)
    ); // this will approve the market for all tokens
  };
  const refresh = async () => {
    // re-renders the whole container with the latest subgraph data
    plugin.destroy();
    await plugin.render(container);
  };
  const div = document.createElement("div");
  div.appendChild(
    createElement({
      type: "button",
      text: "approve",
      eventListeners: [["click", approve]],
    })
  ); // approve button
  div.appendChild(
    createElement({
      type: "button",
      text: "refresh",
      eventListeners: [["click", refresh]],
    })
  ); // refresh button
  return div;
}

export default Plugin;
