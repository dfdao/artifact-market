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
import { BigNumber, utils } from "https://cdn.skypack.dev/ethers";

// #region Constants
const SUBGRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name";
const DARKFOREST_GRAPH_ENDPOINT = `${SUBGRAPH_ENDPOINT}/darkforest-eth/dark-forest-v06-round-2`;
const MARKET_GRAPH_ENDPOINT = `${SUBGRAPH_ENDPOINT}/zk-farts/dfartifactmarket`;

// market contract on blockscout: https://blockscout.com/poa/xdai/address/0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8
// when a new round starts ARTIFACTS_ADDRESS must be updated
const ARTIFACTS_ADDRESS = "0xafb1A0C81c848Ad530766aD4BE2fdddC833e1e96";
const MARKET_ADDRESS = "0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8";
const MARKET_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json";
const ARTIFACTS_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/1cac7c4638ee5d766615afe4362e6ce80ed68067/APPROVAL_ABI.json";
const CACHE_KEY = "ARTIFACT-MARKET";
const ARTIFACTS_KEY = "ARTIFACTS-CONTRACT";
const MARKET_KEY = "MARKET-CONTRACT";

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
// #endregion

// #region Types
const TabsType = {
  market: 0,
  listings: 1,
  inventory: 2,
};

const TabsTypeNames = {
  [0]: "Market",
  [1]: "Listings",
  [2]: "Inventory",
};
// #endregion

// #region Components
function Loading() {
  const [indicator, setIndicator] = useState("");
  useEffect(() => {
    let timeout = setTimeout(() => {
      if (indicator.length === 10) setIndicator("");
      else setIndicator(indicator + ". ");
    }, 150); // wait before showing loader

    return () => clearTimeout(timeout);
  }, [indicator]);

  return html` <div style=${{ padding: 8 }}>${indicator}</div> `;
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
        ${formatArtifactName(artifact.artifactType)}
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
// #endregion

// #region Views
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
    justifyContent: "flex-start",
    gridTemplateColumns: "auto auto auto 1fr",
    alignItems: "center",
    bottom: 0,
    width: "100%",
    background: Colors.background,
    borderTop: `1px solid ${Colors.borderlight}`,
  };
  const styleBalance = {
    color: Colors.dfmythic,
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
        <div style=${{ textAlign: "right" }}>
          <${Button}
          style=${{ ...styleTab(), marginLeft: "auto", cursor: "auto" }}
          children=${TabsTypeNames[2]}
          disabled
        >
          ${balanceShort} xDai
        </${Button}>
        </div>
      </div>
    </div>
  `;
}

function Market() {
  const { data, loading, error } = useMarket();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: add buy functionality
  // const onClick = (event) => {
  //   MARKET.buy(BigNumber.from(artifact.idDec), {
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
  const { data, loading, error } = useMarket();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: Add unlist functionality
  // function unlist (event) {
  //   MARKET.unlist(BigNumber.from(artifact.idDec))
  //     .then(() => { /* TODO: ensure market list updates */  })
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
  const { data, loading, error } = useInventory();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  // TODO: add list functionality
  // const onClick = (event) => {
  //   MARKET.list(
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
// #endregion

// #region Hooks
function useCache() {
  const [cache, setCache] = useState(window[CACHE_KEY] || {});
  const updateCache = (update) => setCache({ ...cache, ...update });

  // when cache is set, save it on the window key
  useEffect(() => {
    window[CACHE_KEY] = cache;
  }, [cache]);

  return [cache, updateCache];
}

function useContract(KEY, ABI, ADDRESS) {
  const [cache, updateCache] = useCache();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cache[KEY]);
  const data = cache[KEY];

  useEffect(async () => {
    if (!cache.contract) {
      const abi = await fetch(ABI)
        .then((res) => res.json())
        .catch(setError);
      const contract = await df.loadContract(ADDRESS, abi).catch(setError);

      updateCache({ [KEY]: { abi, contract } });
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}

function useMarketContract() {
  return useContract(MARKET_KEY, MARKET_ABI, MARKET_ADDRESS);
}

function useArtifactsContract() {
  return useContract(ARTIFACTS_KEY, ARTIFACTS_ABI, ARTIFACTS_ADDRESS);
}

function useMarket() {
  const marketContract = useMarketContract();
  const subgraph = useSubgraph();

  return {
    data: {
      artifactsForSale: subgraph.data?.artifactsForSale,
      artifactsListed: subgraph.data?.artifactsListed,
      marketContract: marketContract.data,
    },
    loading: marketContract.loading || subgraph.loading,
    error: marketContract.error || subgraph.error,
  };
}

function useInventory() {
  const artifactsContract = useArtifactsContract();
  const subgraph = useSubgraph();

  return {
    data: {
      artifactsOwned: subgraph.data?.artifactsOwned,
      artifactsContract: artifactsContract.data,
    },
    loading: artifactsContract.loading || subgraph.loading,
    error: artifactsContract.error || subgraph.error,
  };
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
    const price = listings?.othertokens[i]?.price;
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
  return fetch(MARKET_GRAPH_ENDPOINT, {
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
  return fetch(DARKFOREST_GRAPH_ENDPOINT, {
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
        
        shopartifacts: artifacts(where:{owner:"${MARKET_ADDRESS.toLowerCase()}"}){
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
// #endregion

// #region Style Helpers
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

// convert key to match df format, return color
function rarityColor(key) {
  const rarity = key[0] + key.toLowerCase().slice(1, key.length); // COMMON => Common
  const rarityId = ArtifactRarity[rarity];
  return RarityColors[rarityId];
}
// #endregion

// #region Format Helpers

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

// convert uppercase artifactType to properly formatted name
function formatArtifactName(name) {
  const typeID = Object.keys(ArtifactType).find(
    (key) => key.toUpperCase() === name
  );
  const artifactId = ArtifactType[typeID];
  return ArtifactTypeNames[artifactId];
}
// #endregion

// #region Wallet Helpers
function getMyBalance() {
  return df.getMyBalanceEth();
}

// This contains a terrible hack around bad APIs
// getMyBalance$() emitter emits BigNumbers instead of the same type as returned by getMyBalance()
function subscribeToMyBalance(cb) {
  return df.getMyBalance$().subscribe(() => cb(getMyBalance()));
}
// #endregion

// #region Plugin
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
// #endregion

export default Plugin;
