import { ArtifactRarity } from "@darkforest_eth/types";

// market contract on blockscout: https://blockscout.com/poa/xdai/address/0x3Fb840EbD1fFdD592228f7d23e9CA8D55F72F2F8
// when a new round starts APPROVAL_ADDRESS must be updated
export const APPROVAL_ADDRESS = "0x621ce133521c3B1cf11C0b9423406F01835af0ee";
export const MARKET_ADDRESS = "0x1e7cb1dbC6DaD80c86e8918382107238fb4562a8";
export const MARKET_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/5761e33760932affcbc3b13dd28f6925/raw/afd3c6d8eba7c27148afc9092bfe411d061d58a3/MARKET_ABI.json";
export const APPROVAL_ABI =
  "https://gist.githubusercontent.com/zk-FARTs/d5d9f3fc450476b40fd12832298bb54c/raw/283098b02d906488796441f38f94c6d7d513c797/APPROVAL_ABI.json";
export const CACHE_KEY = "ARTIFACT-MARKET";
export const APPROVAL_KEY = "APPROVAL-CONTRACT";
export const MARKET_KEY = "MARKET-CONTRACT";
export const POLL_INTERVAL = 5000;

// Dark Forest Helpers - ideally these would be imported from cdn

export const colors = {
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
export const Raritycolors = {
  [ArtifactRarity.Unknown]: colors.dfblack,
  [ArtifactRarity.Common]: colors.muted,
  [ArtifactRarity.Rare]: colors.dfrare,
  [ArtifactRarity.Epic]: colors.dfepic,
  [ArtifactRarity.Legendary]: colors.dflegendary,
  [ArtifactRarity.Mythic]: colors.dfmythic,
};
