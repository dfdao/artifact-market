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

// Approve the market for all tokens
// TOKENS.setApprovalForAll(SALES_CONTRACT_ADDRESS, true).catch(console.log)

// Dark Forest Helpers - ideally these would be imported from cdn

const Colors = {
  muted: "#838383",
  gray: "#aaaaaa",
  background: "#151515",
  backgrounddark: "#252525",
  border: "#777",
  borderlight: "#5f5f5f",
  blueBackground: "#0a0a23",
  dfblue: "#00ADE1",
  dfgreen: "#00DC82",
  dfred: "#FF6492",
  dfyellow: "#e8e228",
  dfpurple: "#9189d9",
  dfwhite: "#ffffff",
  dfblack: "#000000",
  dfrare: "#6b68ff",
  dfepic: "#c13cff",
  dflegendary: "#f8b73e",
  dfmythic: "#ff44b7",
};

// https://github.com/darkforest-eth/client/blob/00492e06b8acf378e7dacc1c02b8ede61481bba3/src/Frontend/Styles/Colors.tsx
const RarityColors = {
  [ArtifactRarity.Unknown]: Colors.dfblack,
  [ArtifactRarity.Common]: Colors.muted,
  [ArtifactRarity.Rare]: Colors.dfrare,
  [ArtifactRarity.Epic]: Colors.dfepic,
  [ArtifactRarity.Legendary]: Colors.dflegendary,
  [ArtifactRarity.Mythic]: Colors.dfmythic,
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

const TabsType = {
  market: 0,
  listings: 1,
  inventory: 2,
  activity: 3,
};

const TabsTypeNames = {
  [0]: "Market",
  [1]: "Listings",
  [2]: "Inventory",
  [3]: "Activity",
};

function App() {
  const [activeTab, setActiveTab] = useState(TabsType.market);
  const { balanceShort } = useWallet();

  const styleTabContainer = {
    position: "relative",
    height: "100%",
  };
  const styleTabContent = {
    paddingBottom: "44px",
    height: "100%",
    overflowY: "scroll",
  };
  const styleTabs = {
    display: "grid",
    position: "absolute",
    padding: "8px",
    gridColumnGap: "8px",
    gridTemplateColumns: "auto auto auto auto 1fr",
    justifyContent: "flex-start",
    alignItems: "center",
    bottom: 0,
    width: "100%",
    background: Colors.background,
    borderTop: `1px solid ${Colors.borderlight}`,
  };
  const styleBalance = {
    color: Colors.dfyellow,
    textAlign: "right",
  };

  const styleTab = (isActive) => ({
    color: isActive ? Colors.dfwhite : Colors.muted,
    background: Colors.background,
  });

  return html`
    <div style=${styleTabContainer}>
      <div style=${styleTabContent}>
        ${TabsType.market === activeTab && html`<${Market} />`}
        ${TabsType.listings === activeTab && html`<${Listings} />`}
        ${TabsType.inventory === activeTab && html`<${Inventory} />`}
        ${TabsType.activity === activeTab && html`<${Activity} />`}
      </div>
      <div style=${styleTabs}>
        <${Button}
          style=${styleTab(TabsType.market === activeTab)}
          onClick=${() => setActiveTab(TabsType.market)}
          children=${TabsTypeNames[0]}
        />
        <${Button}
          style=${styleTab(TabsType.listings === activeTab)}
          onClick=${() => setActiveTab(TabsType.listings)}
          children=${TabsTypeNames[1]}
        />
        <${Button}
          style=${styleTab(TabsType.inventory === activeTab)}
          onClick=${() => setActiveTab(TabsType.inventory)}
          children=${TabsTypeNames[2]}
        />
        <${Button}
          style=${styleTab(TabsType.activity === activeTab)}
          onClick=${() => setActiveTab(TabsType.activity)}
          children=${TabsTypeNames[3]}
        />
        <span style=${styleBalance}>${balanceShort} xDai</span>
      </div>
    </div>
  `;
}

function Market() {
  const { data, loading, error } = useSubgraph();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: add buy functionality
  // const onClick = (event) => {
  //   SALES.buy(BigNumber.from(artifact.idDec), {
  //     value: BigNumber.from(artifact.price),
  //   })
  //     .then(() => { /* TODO: ensure item moves from Market to Inventory */})
  //     .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  // };

  // TODO: add sale price
  // utils.formatEther(artifact.price)

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
        title="Artifacts For Sale"
        empty="There aren't currently any artifacts listed for sale."
        action="buy"
        price="1.0"
        artifacts=${data.artifactsForSale}
      />
    </div>
  `;
}

function Listings() {
  const { data, loading, error } = useSubgraph();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: Add unlist functionality
  // function unlist (event) {
  //   SALES.unlist(BigNumber.from(artifact.idDec))
  //     .then(() => { /* TODO: ensure sales list updates */  })
  //     .catch(console.log); // catch error (in case of tx failure or something else)
  // }

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
        title="Your Listed Artifacts"
        empty="You don't currently have any artifacts listed."
        artifacts=${data.artifactsListed}
      />
    </div>
  `;
}

function Inventory() {
  const { data, loading, error } = useSubgraph();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: add list functionality
  // const onClick = (event) => {
  //   SALES.list(
  //     BigNumber.from(artifact.idDec),
  //     utils.parseEther(value.toString())
  //   )
  //     .then(() => { /* TODO: ensure item moves from inventory to Listings */})
  //     .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  // };

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
        action="sell"
        artifacts=${data.artifactsOwned}
      />
    </div>
  `;
}

function Activity() {
  const styleActivity = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  return html` <div style=${styleActivity}></div> `;
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
      <div style=${artifactsStyle}>${artifactsChildren}</div>
    </div>
  `;
}

function Artifact({ artifact, price, action }) {
  const artifactStyle = {
    display: "grid",
    gridTemplateColumns: "2.6fr 1fr 1fr 1fr 1fr 1fr auto",
    gridColumnGap: "8px",
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
      <div>
        <${Button}
          theme=${action === "buy" ? "green" : "yellow"}
          style=${{ marginLeft: "8px" }}
          children=${action}
        />
      </div>
    </div>
  `;
}

function Button({ children, style, theme = "default", onClick }) {
  const [isActive, setIsActive] = useState(false);

  return html`
    <button
      style=${{ ...styleButton(theme, isActive), ...style }}
      onMouseEnter=${() => setIsActive(true)}
      onMouseLeave=${() => setIsActive(false)}
      onClick=${onClick}
    >
      ${children}
    </button>
  `;
}

function styleButton(theme, isActive) {
  const styleBase = {
    padding: "2px 8px",
    border: 0,
    color: isActive ? Colors.gray.dfblack : Colors.gray,
    outline: "none",
  };

  return { ...styleBase, ...themeButton(theme, isActive) };
}

function themeButton(theme, isActive) {
  switch (theme) {
    case "blue":
    case "info":
      return {
        background: isActive ? Colors.dfblue : Colors.backgrounddark,
      };
    case "yellow":
    case "warning":
      return {
        background: isActive ? Colors.dfyellow : Colors.backgrounddark,
      };
    case "green":
    case "success":
      return {
        background: isActive ? Colors.dfgreen : Colors.backgrounddark,
      };
    case "red":
    case "danger":
      return {
        background: isActive ? Colors.dfgreen : Colors.backgrounddark,
      };
    case "gray":
    case "default":
    default:
      return {
        background: isActive ? Colors.muted : Colors.backgrounddark,
      };
  }
}

// Wallet functionality
function getMyBalance() {
  return df.getMyBalanceEth();
}

// This contains a terrible hack around bad APIs
// getMyBalance$() emitter emits BigNumbers instead of the same type as returned by getMyBalance()
export function subscribeToMyBalance(cb) {
  return df.getMyBalance$().subscribe(() => cb(getMyBalance()));
}

function useWallet() {
  const [balance, setBalance] = useState(getMyBalance);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

  return { balance, balanceShort: Number.parseFloat(balance).toFixed(2) };
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
  if (value > 100) return Colors.dfgreen;
  return Colors.dfred;
}

export default Plugin;
