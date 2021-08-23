import { MARKET_ABI, APPROVAL_ABI } from "../generated/abi";
import { MARKET_ADDRESS, APPROVAL_ADDRESS } from "../generated/contract";

const { getPlanetName } = df.getProcgenUtils();

export function planetName(locationId) {
  if (locationId) {
    // Fake a planet
    return getPlanetName({ locationId });
  } else {
    return "No planet selected";
  }
}

export function playerName(address) {
  if (address) {
    const twitter = df.getTwitter(address);
    if (twitter) {
      return twitter;
    } else {
      return address.substring(0, 6);
    }
  }

  return "Unknown";
}

export function getAccount() {
  return df.account;
}

export async function getContract() {
  const market = await df.loadContract(MARKET_ADDRESS, MARKET_ABI);
  const approval = await df.loadContract(APPROVAL_ADDRESS, APPROVAL_ABI);

  return {
    market,
    marketAddress: MARKET_ADDRESS,
    marketABI: MARKET_ABI,
    approval,
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
