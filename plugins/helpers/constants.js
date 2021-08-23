import { version, homepage, bugs } from "../../package.json";
import { MARKET_ADDRESS } from "../generated/contract";
export { MARKET_ADDRESS, APPROVAL_ADDRESS } from "../generated/contract";

export const POLL_INTERVAL = 5000;
export const WEBSITE_URL = homepage;
export const TWITTER_URL = "https://twitter.com/dfdao";
export const GITHUB_URL = "https://github.com/dfdao/artifact-market";
export const CONTRACT_URL = `https://blockscout.com/xdai/mainnet/address/${MARKET_ADDRESS}`;
export const BUGS_URL = bugs.url;
export const VERSION = version;
