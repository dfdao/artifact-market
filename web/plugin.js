import {
  html,
  render,
  useState,
  useEffect,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import {
  ArtifactRarity,
  ArtifactRarityNames,
  ArtifactTypeNames,
  BiomeNames,
} from "http://cdn.skypack.dev/@darkforest_eth/types";
import { BigNumber, utils } from "https://cdn.skypack.dev/ethers";

// #region Constants
// market contract on blockscout: https://blockscout.com/poa/xdai/address/0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8
// when a new round starts APPROVAL_ADDRESS must be updated
const APPROVAL_ADDRESS = "0x621ce133521c3B1cf11C0b9423406F01835af0ee";
const MARKET_ADDRESS = "0x1e7cb1dbC6DaD80c86e8918382107238fb4562a8";
const MARKET_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json";
const APPROVAL_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/283098b02d906488796441f38f94c6d7d513c797/APPROVAL_ABI.json";
const CACHE_KEY = "ARTIFACT-MARKET";
const APPROVAL_KEY = "APPROVAL-CONTRACT";
const MARKET_KEY = "MARKET-CONTRACT";

// Dark Forest Helpers - ideally these would be imported from cdn

const colors = {
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

// https://github.com/darkforest-eth/client/blob/00492e06b8acf378e7dacc1c02b8ede61481bba3/src/Frontend/Styles/colors.tsx
const Raritycolors = {
  [ArtifactRarity.Unknown]: colors.dfblack,
  [ArtifactRarity.Common]: colors.muted,
  [ArtifactRarity.Rare]: colors.dfrare,
  [ArtifactRarity.Epic]: colors.dfepic,
  [ArtifactRarity.Legendary]: colors.dflegendary,
  [ArtifactRarity.Mythic]: colors.dfmythic,
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

const ArtifactSortType = {
  type: "artifactType",
  price: "price",
  energy: "energyCapMultiplier",
  energyGrowth: "energyGroMultiplier",
  range: "rangeMultiplier",
  speed: "speedMultiplier",
  defense: "defMultiplier",
};

const StatIdx = {
  EnergyCap: 0,
  EnergyGro: 1,
  Range: 2,
  Speed: 3,
  Defense: 4,
};

const StatNames = {
  energyCapMultiplier: "EnergyCap",
  energyGroMultiplier: "EnergyGro",
  rangeMultiplier: "Range",
  speedMultiplier: "Speed",
  defMultiplier: "Defense",
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

function ArtifactsHeaderMarket(props) {
  const color = (type) => {
    if (props.sort === type && props.reverse) return colors.dfred;
    if (props.sort === type) return colors.dfgreen;
    return colors.muted;
  };

  const sortBy = (type) => () => {
    if (props.reverse) return props.clear();
    if (props.sort === type) return props.setReverse(true);
    return props.setSort(type);
  };

  const artifactsHeaderStyle = {
    display: "grid",
    marginBottom: "4px",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "center",
  };

  return html`
    <div style=${artifactsHeaderStyle}>
      <${ArtifactHeaderButton}
        style=${{
          justifyContent: "flex-start",
          color: color(ArtifactSortType.type),
        }}
        onClick=${sortBy(ArtifactSortType.type)}
        children="Artifact"
      />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.energy)}>
        <${EnergySVG} color=${color(ArtifactSortType.energy)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.energyGrowth)}>
        <${EnergyGrowthSVG} color=${color(ArtifactSortType.energyGrowth)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.range)}>
        <${RangeSVG} color=${color(ArtifactSortType.range)} />
      </${ArtifactHeaderButton} />
      
      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.speed)}>
        <${SpeedSVG} color=${color(ArtifactSortType.speed)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.defense)}>
        <${DefenseSVG} color=${color(ArtifactSortType.defense)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.price)}>
        <${PriceSVG} color=${color(ArtifactSortType.price)} />
      </${ArtifactHeaderButton} />

      <${Input}
        type="search"
        placeholder="search..."
        value=${props.filter} 
        onChange=${props.setFilter} 
        style=${{ width: "100%", fontSize: 12 }}
      />
    </div>
  `;
}

function ArtifactsHeaderInventory(props) {
  const color = (type) => {
    if (props.sort === type && props.reverse) return colors.dfred;
    if (props.sort === type) return colors.dfgreen;
    return colors.muted;
  };

  const sortBy = (type) => () => {
    if (props.reverse) return props.clear();
    if (props.sort === type) return props.setReverse(true);
    return props.setSort(type);
  };

  const artifactsHeaderStyle = {
    display: "grid",
    marginBottom: "4px",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "center",
  };

  return html`
    <div style=${artifactsHeaderStyle}>
      <${ArtifactHeaderButton}
        style=${{
          justifyContent: "flex-start",
          color: color(ArtifactSortType.type),
        }}
        onClick=${sortBy(ArtifactSortType.type)}
        children="Artifact"
      />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.energy)}>
        <${EnergySVG} color=${color(ArtifactSortType.energy)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.energyGrowth)}>
        <${EnergyGrowthSVG} color=${color(ArtifactSortType.energyGrowth)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.range)}>
        <${RangeSVG} color=${color(ArtifactSortType.range)} />
      </${ArtifactHeaderButton} />
      
      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.speed)}>
        <${SpeedSVG} color=${color(ArtifactSortType.speed)} />
      </${ArtifactHeaderButton} />

      <${ArtifactHeaderButton} onClick=${sortBy(ArtifactSortType.defense)}>
        <${DefenseSVG} color=${color(ArtifactSortType.defense)} />
      </${ArtifactHeaderButton} />

      <${Input}
        type="search"
        placeholder="search..."
        value=${props.filter} 
        onChange=${props.setFilter} 
        style=${{ width: "100%", fontSize: 12 }}
      />
    </div>
  `;
}

function ArtifactsHeaderBuySell() {
  const artifactsHeaderStyle = {
    display: "grid",
    marginBottom: "4px",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "right",
    alignItems: "center",
  };

  return html`
    <div style=${artifactsHeaderStyle}>
      <div
        style=${{
          display: "flex",
          justifyContent: "flex-start",
          color: colors.muted,
        }}
      >
        Artifact
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${EnergySVG} />
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${EnergyGrowthSVG} />
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${RangeSVG} />
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${SpeedSVG} />
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${DefenseSVG} />
      </div>
      <div style=${{ display: "flex", justifyContent: "flex-end" }}>
        <${PriceSVG} />
      </div>
      <div></div>
    </div>
  `;
}

function ArtifactHeaderButton({ children, style, onClick }) {
  const buttonStyle = {
    display: "flex",
    padding: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    background: colors.background,
    ...style,
  };

  return html`
    <${Button} style=${buttonStyle} onClick=${onClick}>
      ${children}
    </${Button}>
  `;
}

function ArtifactsMarket({ empty, artifacts = [], setActiveArtifact }) {
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState("");
  const [reverse, setReverse] = useState(false);
  const clear = () => {
    setSort(null);
    setReverse(false);
  };

  const bySort = (a, b) => {
    if (!sort) return b.rarity - a.rarity;
    if (sort === ArtifactSortType.type) {
      const nameA = ArtifactTypeNames[a[sort]];
      const nameB = ArtifactTypeNames[b[sort]];
      if (nameA < nameB) return reverse ? 1 : -1;
      if (nameA > nameB) return reverse ? -1 : 1;
      return 0;
    }
    const valA = formatMultiplierArtifact(a, sort);
    const valB = formatMultiplierArtifact(b, sort);
    return reverse ? valA - valB : valB - valA;
  };

  const byFilter = ({ artifactType, rarity }) => {
    const letters = filter.toLowerCase();
    const hasLetters = (text) => text.toLowerCase().includes(letters);
    if (hasLetters(ArtifactTypeNames[artifactType])) return true;
    if (hasLetters(ArtifactRarityNames[rarity])) return true;
  };

  const artifactsStyle = {
    display: "grid",
    gridRowGap: "4px",
  };

  const emptyStyle = {
    color: "#838383",
  };

  const artifactsChildren = artifacts.length
    ? artifacts
        .sort(bySort)
        .filter(byFilter)
        .map(
          (artifact) =>
            html`<${ArtifactMarket}
              key=${artifact.id}
              artifact=${artifact}
              action=${setActiveArtifact(artifact)}
            />`
        )
    : html`<p style=${emptyStyle}>${empty}</p>`;

  return html`
    <div>
      ${!!artifacts.length &&
      html`
        <${ArtifactsHeaderMarket}
          sort=${sort}
          setSort=${setSort}
          filter=${filter}
          setFilter=${setFilter}
          reverse=${reverse}
          setReverse=${setReverse}
          clear=${clear}
        />
      `}
      <div style=${artifactsStyle}>${artifactsChildren}</div>
    </div>
  `;
}

function ArtifactsInventory({ empty, artifacts = [], setActiveArtifact }) {
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState("");
  const [reverse, setReverse] = useState(false);
  const clear = () => {
    setSort(null);
    setReverse(false);
  };

  const bySort = (a, b) => {
    if (!sort) return b.rarity - a.rarity;
    if (sort === ArtifactSortType.type) {
      const nameA = ArtifactTypeNames[a[sort]];
      const nameB = ArtifactTypeNames[b[sort]];
      if (nameA < nameB) return reverse ? 1 : -1;
      if (nameA > nameB) return reverse ? -1 : 1;
      return 0;
    }
    const valA = formatMultiplierArtifact(a, sort);
    const valB = formatMultiplierArtifact(b, sort);
    return reverse ? valA - valB : valB - valA;
  };

  const byFilter = ({ artifactType, rarity }) => {
    const letters = filter.toLowerCase();
    const hasLetters = (text) => text.toLowerCase().includes(letters);
    if (hasLetters(ArtifactTypeNames[artifactType])) return true;
    if (hasLetters(ArtifactRarityNames[rarity])) return true;
  };

  const artifactsStyle = {
    display: "grid",
    gridRowGap: "4px",
  };

  const emptyStyle = {
    color: "#838383",
  };

  const artifactsChildren = artifacts.length
    ? artifacts
        .sort(bySort)
        .filter(byFilter)
        .map(
          (artifact) =>
            html`<${Artifact}
              key=${artifact.id}
              artifact=${artifact}
              action=${setActiveArtifact(artifact)}
            />`
        )
    : html`<p style=${emptyStyle}>${empty}</p>`;

  return html`
    <div>
      ${!!artifacts.length &&
      html`
        <${ArtifactsHeaderInventory}
          sort=${sort}
          setSort=${setSort}
          filter=${filter}
          setFilter=${setFilter}
          reverse=${reverse}
          setReverse=${setReverse}
          clear=${clear}
        />
      `}
      <div style=${artifactsStyle}>${artifactsChildren}</div>
    </div>
  `;
}

function Artifact({ artifact, action }) {
  const artifactStyle = {
    display: "grid",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "right",
  };

  const artifactTypeStyle = {
    color: Raritycolors[artifact.rarity],
    textAlign: "left",
  };

  return html`
    <div style=${artifactStyle}>
      <div style=${artifactTypeStyle}>
        ${ArtifactTypeNames[artifact.artifactType]}
      </div>
      ${Array.from({ length: 5 }, (_, i) => i).map(
        (val) => html`
          <${UpgradeStatInfo}
            upgrades=${[artifact.upgrade, artifact.timeDelayedUpgrade]}
            stat=${val}
            key=${val}
          />
        `
      )}
      <div>${action}</div>
    </div>
  `;
}

function ArtifactDetails({ artifact }) {
  const stylesArtifactDetails = {
    margin: "16px auto",
  };

  return html`
    <div style=${stylesArtifactDetails}>
      <${Detail}
        title="rarity"
        description=${ArtifactRarityNames[artifact.rarity]}
      />

      <${Detail}
        title="biome"
        description=${BiomeNames[artifact.planetBiome]}
      />

      <${Detail} title="seller" description=${artifact.owner || df.account} />
      <${Detail} title="discoverer" description=${artifact.discoverer} />

      <${Detail}
        title="discovered"
        description=${formatDateTime(artifact.mintedAtTimestamp) || "never"}
      />

      <${Detail}
        title="last activated"
        description=${formatDateTime(artifact.lastActivated) || "never"}
      />

      <${Detail}
        title="last deactivated"
        description=${formatDateTime(artifact.lastDeactivated) || "never"}
      />

      <${Detail} title="price" description=${`${artifact.price} xDai`} />
    </div>
  `;
}

function ArtifactMarket({ artifact, action }) {
  const artifactStyle = {
    display: "grid",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "right",
  };

  const artifactTypeStyle = {
    color: Raritycolors[artifact.rarity],
    textAlign: "left",
  };

  return html`
    <div style=${artifactStyle}>
      <div style=${artifactTypeStyle}>
        ${ArtifactTypeNames[artifact.artifactType]}
      </div>
      ${Array.from({ length: 5 }, (_, i) => i).map(
        (val) => html`
          <${UpgradeStatInfo}
            upgrades=${[artifact.upgrade, artifact.timeDelayedUpgrade]}
            stat=${val}
            key=${val}
          />
        `
      )}
      <div>${artifact.price ? Number(artifact.price).toFixed(2) : ""}</div>
      <div>${action}</div>
    </div>
  `;
}

function UpgradeStatInfo({ upgrades, stat }) {
  const val = formatMultiplierValue({ upgrades, stat });
  const text = formatMultiplierText({ upgrades, stat });

  return html`
    <div style=${{ color: formatMultiplierColor(val) }}>${text}</div>
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

function Input({
  value,
  onChange,
  style,
  type = "text",
  placeholder = "",
  step,
  min,
}) {
  const inputStyle = {
    outline: "none",
    background: "rgb(21, 21, 21)",
    color: "rgb(131, 131, 131)",
    borderRadius: "4px",
    border: "1px solid rgb(95, 95, 95)",
    padding: "0 4px",
    ...style,
  };

  return html`
    <input
      style=${inputStyle}
      type=${type}
      step=${step}
      min=${min}
      value=${value}
      placeholder=${placeholder}
      onInput=${(e) => onChange(e.target.value)}
    />
  `;
}

function Detail({ title, description }) {
  return html`
    <p>
      ${title}: <span style=${{ color: colors.dfwhite }}>${description}</span>
    </p>
  `;
}
// #endregion

// #region Icons
const DefaultSVG = ({ children, width, height }) => html`
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="16px"
    height="16px"
    viewBox=${`0 0 ${height || 512} ${width || 512}`}
  >
    ${children}
  </svg>
`;

const EnergySVG = ({ color }) => html`
  <${DefaultSVG}>
    <path
      style=${{ fill: color || colors.muted }}
      d="M352 0l-288 288h176l-80 224 288-288h-176z"
    ></path>
  </${DefaultSVG}>
`;

const EnergyGrowthSVG = ({ color }) => html`
  <${DefaultSVG}>
    <path
      style=${{ fill: color || colors.muted }}
      d="M251.6,164.4L416,0l-75,210H234.8L251.6,164.4z M407.4,224L284.2,343.4L224,512l288-288H407.4z"
    />
    <path
      style=${{ fill: color || colors.muted }}
      d="M288,0L0,288h176L96,512l288-288H208L288,0z"
    />
  </${DefaultSVG}>
`;

const RangeSVG = ({ color }) => html`
  <${DefaultSVG}>
    <path
      style=${{ fill: color || colors.muted }}
      d="M118.627 438.627l265.373-265.372v114.745c0 17.673 14.327 32 32 32s32-14.327 32-32v-192c0-12.942-7.797-24.611-19.754-29.563-3.962-1.642-8.121-2.42-12.246-2.419v-0.018h-192c-17.673 0-32 14.327-32 32 0 17.674 14.327 32 32 32h114.745l-265.372 265.373c-6.249 6.248-9.373 14.438-9.373 22.627s3.124 16.379 9.373 22.627c12.496 12.497 32.758 12.497 45.254 0z"
    ></path>
  </${DefaultSVG}>
`;

const SpeedSVG = ({ color }) => html`
  <${DefaultSVG}>
    <path
      style=${{ fill: color || colors.muted }}
      d="M256 432v-160l-160 160v-352l160 160v-160l176 176z"
    ></path>
  </${DefaultSVG}>
`;

const DefenseSVG = ({ color }) => html`
  <${DefaultSVG}>
    <path
      style=${{ fill: color || colors.muted }}
      d="M256.002 52.45l143.999 78.545-0.001 109.005c0 30.499-3.754 57.092-11.477 81.299-7.434 23.303-18.396 43.816-33.511 62.711-22.371 27.964-53.256 51.74-99.011 76.004-45.753-24.263-76.644-48.042-99.013-76.004-15.116-18.896-26.078-39.408-33.512-62.711-7.722-24.207-11.476-50.8-11.476-81.299v-109.004l144.002-78.546zM256.003 0c-2.637 0-5.274 0.651-7.663 1.954l-176.002 96c-5.14 2.803-8.338 8.191-8.338 14.046v128c0 70.394 18.156 127.308 55.506 173.995 29.182 36.478 69.072 66.183 129.34 96.315 2.252 1.126 4.704 1.689 7.155 1.689s4.903-0.563 7.155-1.689c60.267-30.134 100.155-59.839 129.337-96.315 37.351-46.687 55.507-103.601 55.507-173.995l0.001-128c0-5.855-3.198-11.243-8.338-14.046l-175.999-96c-2.387-1.303-5.024-1.954-7.661-1.954v0z"
    ></path>
    <path
      style=${{ fill: color || colors.muted }}
      d="M160 159.491v80.509c0 25.472 3.011 47.293 9.206 66.711 5.618 17.608 13.882 33.085 25.265 47.313 14.589 18.237 34.038 34.408 61.531 50.927 27.492-16.518 46.939-32.688 61.53-50.927 11.382-14.228 19.646-29.704 25.263-47.313 6.194-19.418 9.205-41.239 9.205-66.711l0.001-80.51-95.999-52.363-96.002 52.364z"
    ></path>
  </${DefaultSVG}>
`;

const PriceSVG = ({ color }) => html`
  <${DefaultSVG}>
    <path style=${{ fill: color || colors.muted }} 
    d="M212 40H40V126H212V40ZM298 40H470V126H298V40ZM126 384H212V470H126H40V384V298H126V384ZM298 384H384V298H470V384V470H384H298V384Z"/>
  </${DefaultSVG}>
`;
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
    background: colors.background,
    borderTop: `1px solid ${colors.borderlight}`,
  };

  const styleTab = (isActive) => ({
    color: isActive ? colors.dfwhite : colors.muted,
    background: colors.background,
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
  const [activeArtifact, setActiveArtifact] = useState(false);
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  const withdraw = (artifact) => {
    data.marketContract?.contract
      .unlist(BigNumber.from("0x" + artifact.id))
      .then(() => {})
      .catch((e) => console.log(e));
  };

  if (loading) return html`<${Loading} />`;

  if (error)
    return html`
      <div>
        <h1>Something went wrong...</h1>
        <p>${JSON.stringify(error, null, 2)}</p>
      </div>
    `;

  if (activeArtifact)
    return html`
      <${MarketBuy}
        artifact=${activeArtifact}
        setActiveArtifact=${setActiveArtifact}
      />
    `;

  return html`
    <div style=${artifactsStyle}>
      <${ArtifactsMarket}
        title="Artifacts For Sale"
        empty="There aren't currently any artifacts listed for sale."
        artifacts=${data.artifacts}
        setActiveArtifact=${(artifact) =>
          data.isArtifactOwned(artifact)
            ? html`
                <${Button}
                  children="withdraw"
                  style=${{ width: "100%" }}
                  onClick=${() => withdraw(artifact)}
                />
              `
            : html`
                <${Button}
                  children="view"
                  style=${{ width: "100%" }}
                  onClick=${() => setActiveArtifact(artifact)}
                />
              `}
      />
    </div>
  `;
}

function MarketBuy({ artifact, setActiveArtifact }) {
  const { data } = useMarket();
  const styleInventoryBuy = { padding: 8 };

  const buyArtifact = () => {
    data.marketContract?.contract
      .buy(BigNumber.from("0x" + artifact.id), {
        value: artifact.priceRaw,
        gasLimit: 250000,
      })
      .then((res) => {
        console.log(JSON.stringify(res, null, 2));
        setActiveArtifact(false);
      })
      .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  };

  return html`
    <div style=${styleInventoryBuy}>
      <${ArtifactsHeaderBuySell} />
      <${ArtifactMarket} artifact=${artifact} />
      <${ArtifactDetails} artifact=${artifact} />

      <div
        style=${{
          display: "grid",
          gridColumnGap: "8px",
          gridAutoFlow: "column",
          placeContent: "center",
        }}
      >
        <${Button}
          theme="green"
          onClick=${buyArtifact}
          style=${{ width: "192px" }}
          children="buy"
        />

        <${Button}
          theme="red"
          onClick=${() => setActiveArtifact(false)}
          style=${{ width: "192px" }}
          children="cancel"
        />
      </div>
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

  const withdraw = (artifact) => {
    data.marketContract?.contract
      .unlist(BigNumber.from("0x" + artifact.id))
      .then(() => {})
      .catch((e) => console.log(e));
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
      <${ArtifactsMarket}
        title="Artifacts For Sale"
        empty="You don't have any artifacts listed for sale."
        artifacts=${data.artifactsListed}
        setActiveArtifact=${(artifact) => html`
          <${Button}
            children="withdraw"
            style=${{ width: "100%" }}
            onClick=${() => withdraw(artifact)}
          />
        `}
      />
    </div>
  `;
}

function Inventory() {
  const { data, loading, error } = useInventory();
  const [activeArtifact, setActiveArtifact] = useState(false);
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
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

  if (activeArtifact)
    return html`
      <${InventorySell}
        artifact=${activeArtifact}
        setActiveArtifact=${setActiveArtifact}
      />
    `;

  return html`
    <div style=${artifactsStyle}>
      <${ArtifactsInventory}
        title="Your Artifacts"
        empty="You don't currently have any artifacts in your inventory. Withdraw them from spacetime rips or buy some from the market."
        artifacts=${data.artifacts}
        setActiveArtifact=${(artifact) => html`
          <${Button}
            children="view"
            style=${{ width: "100%" }}
            onClick=${() => setActiveArtifact(artifact)}
          />
        `}
      />
    </div>
  `;
}

function InventorySell({ artifact, setActiveArtifact }) {
  useApproval();
  const [price, setPrice] = useState(0);
  const { data } = useMarket();
  const styleInventorySell = { padding: 8 };

  const onClickList = () => {
    console.log(
      BigNumber.from("0x" + artifact.id),
      utils.parseEther(price.toString())
    );
    data.marketContract?.contract
      .list(
        BigNumber.from("0x" + artifact.id),
        utils.parseEther(price.toString()),
        {
          gasLimit: 250000,
        }
      )
      .then((res) => {
        console.log(JSON.stringify(res, null, 2));
        setActiveArtifact(false);
      })
      .catch((e) => console.log(e)); // catch error (in case of tx failure or something else)
  };

  return html`
    <div style=${styleInventorySell}>
      <${ArtifactsHeaderBuySell} />
      <${ArtifactMarket} artifact=${{ ...artifact, price }} />
      <${ArtifactDetails} artifact=${{ ...artifact, price }} />

      <div
        style=${{
          display: "grid",
          gridColumnGap: "8px",
          gridAutoFlow: "column",
          placeContent: "center",
        }}
      >
        <${Input}
          type="number"
          min="0"
          step="1"
          value=${price}
          onChange=${setPrice}
          style=${{ width: "128px" }}
        />

        <${Button}
          theme="green"
          style=${{ width: "128px" }}
          children="list"
          onClick=${onClickList}
        />

        <${Button}
          theme="red"
          style=${{ width: "128px" }}
          children="cancel"
          onClick=${() => setActiveArtifact(false)}
        />
      </div>
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

      updateCache({ [KEY]: { abi, contract, address: ADDRESS } });
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}

function useMarketContract() {
  return useContract(MARKET_KEY, MARKET_ABI, MARKET_ADDRESS);
}

function useApprovalContract() {
  return useContract(APPROVAL_KEY, APPROVAL_ABI, APPROVAL_ADDRESS);
}

function useMarket() {
  const marketContract = useMarketContract();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const artifactsListed = artifacts.filter(
    (artifact) => artifact.owner?.toLowerCase() === df.account.toLowerCase()
  );

  const fetchMarket = () =>
    df.contractsAPI
      .getPlayerArtifacts(MARKET_ADDRESS)
      .then((afx) =>
        Promise.all(
          afx.map(async (artifact) =>
            marketContract.data.contract
              .listings(BigNumber.from("0x" + artifact.id))
              .then(([owner, priceRaw]) => ({
                ...artifact,
                owner,
                priceRaw,
                price: utils.formatEther(priceRaw),
              }))
              .catch(setError)
          )
        )
      )
      .then(setArtifacts)
      .then(() => setLoading(false))
      .catch(setError);

  useEffect(fetchMarket, []);

  useEffect(() => {
    const poll = setInterval(fetchMarket, 1000);
    return () => clearInterval(poll);
  }, []);

  return {
    data: {
      artifacts,
      artifactsListed,
      isArtifactOwned: (a) =>
        a.owner?.toLowerCase() === df.account.toLowerCase(),
      marketContract: marketContract?.data,
    },
    loading: marketContract.loading || loading,
    error: marketContract.error || error,
    refetch: fetchMarket,
  };
}

function useInventory() {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    df.contractsAPI
      .getPlayerArtifacts(df.account)
      .then(setArtifacts)
      .then(() => setLoading(false))
      .catch(setError);
  }, []);

  return {
    data: {
      artifacts,
    },
    loading,
    error,
  };
}

function useApproval() {
  const approvalContract = useApprovalContract();
  const [isApproved, setIsApproved] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  if (error) console.log(error);

  useEffect(() => {
    const isApprovedForAll = approvalContract.data?.contract.isApprovedForAll;
    const setApproved = approvalContract.data?.contract.setApprovalForAll;

    if (
      isApprovedForAll &&
      !isApproved &&
      !loading &&
      !approvalContract.loading
    ) {
      setLoading(true);
      isApprovedForAll(df.account, MARKET_ADDRESS)
        .then((approved) => {
          if (!approved) return setApproved(MARKET_ADDRESS, true);
          return;
        })
        .then(() => {
          setIsApproved(true);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [approvalContract.data?.contract]);

  return {
    data: {
      isApproved,
      approvalContract: approvalContract.data,
    },
    loading: loading || approvalContract.loading,
    error: error || approvalContract.error,
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
// #endregion

// #region Style Helpers
function styleButton(theme, isActive) {
  const styleBase = {
    padding: "2px 8px",
    border: 0,
    color: isActive ? colors.gray.dfblack : colors.gray,
    outline: "none",
  };

  return { ...styleBase, ...themeButton(theme, isActive) };
}

function themeButton(theme, isActive) {
  switch (theme) {
    case "blue":
    case "info":
      return {
        background: isActive ? colors.dfblue : colors.backgrounddark,
      };
    case "yellow":
    case "warning":
      return {
        background: isActive ? colors.dfyellow : colors.backgrounddark,
      };
    case "green":
    case "success":
      return {
        background: isActive ? colors.dfgreen : colors.backgrounddark,
      };
    case "red":
    case "danger":
      return {
        background: isActive ? colors.dfred : colors.backgrounddark,
      };
    case "gray":
    case "default":
    default:
      return {
        background: isActive ? colors.muted : colors.backgrounddark,
      };
  }
}
// #endregion

// #region Format Helpers
function getUpgradeStat(upgrade, stat) {
  if (stat === StatIdx.EnergyCap) return upgrade.energyCapMultiplier;
  else if (stat === StatIdx.EnergyGro) return upgrade.energyGroMultiplier;
  else if (stat === StatIdx.Range) return upgrade.rangeMultiplier;
  else if (stat === StatIdx.Speed) return upgrade.speedMultiplier;
  else if (stat === StatIdx.Defense) return upgrade.defMultiplier;
  else return upgrade.energyCapMultiplier;
}

function formatMultiplierArtifact(artifact, statName) {
  const upgrades = [artifact.upgrade, artifact.timeDelayedUpgrade];
  const stat = StatIdx[StatNames[statName]];
  return formatMultiplierValue({ upgrades, stat });
}

function formatMultiplierValue({ upgrades, stat }) {
  // let mult = 100;

  // for (const upgrade of upgrades) {
  //   if (upgrade) {
  //     mult *= getUpgradeStat(upgrade, stat) / 100;
  //   }
  // }

  return upgrades.reduce((mult, upgrade) => {
    if (upgrade) mult *= getUpgradeStat(upgrade, stat) / 100;
    return mult;
  }, 100);
}

function formatMultiplierText({ upgrades, stat }) {
  const val = formatMultiplierValue({ upgrades, stat });
  if (val === 100) return `+0%`;
  if (val > 100) return `+${Math.round(val) - 100}%`;
  return `-${100 - Math.round(val)}%`;
}

function formatMultiplierColor(value) {
  if (value === 100) return colors.muted;
  if (value > 100) return colors.dfgreen;
  return colors.dfred;
}

function formatDateTime(timestamp) {
  if (!timestamp) return 0;
  const date = new Date(timestamp * 1000);
  return `${date.toDateString()} ${date.toLocaleTimeString()}`;
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
    this.container.style.width = "600px";
    this.container.style.height = "400px";
    this.container.style.padding = 0;
    render(html`<${App} />`, container);
  }

  destroy() {
    render(null, this.container);
  }
}
// #endregion

export default Plugin;
