import { MARKET_ABI, APPROVAL_ABI } from "../generated/abi";
import { MARKET_ADDRESS, APPROVAL_ADDRESS } from "../generated/contract";

const { getPlanetName, getPlayerColor } = df.getProcgenUtils();
export const twitter = (address) => df.getTwitter(address);
export const playerColor = getPlayerColor;

export function planetName(locationId) {
  return getPlanetName({ locationId });
}

export function getAccount() {
  return df.account;
}

export async function getContract() {
  return {
    market: await df.loadContract(MARKET_ADDRESS, MARKET_ABI),
    marketAddress: MARKET_ADDRESS,
    marketABI: MARKET_ABI,
    approval: await df.loadContract(APPROVAL_ADDRESS, APPROVAL_ABI),
    approvalAddress: APPROVAL_ADDRESS,
    approvalABI: APPROVAL_ABI,
  };
}

export function getMyBalance() {
  return df.getMyBalanceEth();
}

// This contains a terrible hack around bad APIs
// getMyBalance$() emitter emits BigNumbers instead of the same type as returned by getMyBalance()
export function subscribeToMyBalance(cb) {
  return df.getMyBalance$().subscribe(() => cb(getMyBalance()));
}

export function subscribeToBlockNumber(cb) {
  return df.ethConnection.blockNumber$.subscribe(cb);
}

export function getPlanetByLocationId(locationId) {
  return df.getPlanetWithId(locationId);
}

export function getBlockNumber() {
  return df.ethConnection.blockNumber;
}
