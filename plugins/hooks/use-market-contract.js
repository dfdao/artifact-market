import { useContract } from "./use-contract";
import { MARKET_KEY, MARKET_ABI, MARKET_ADDRESS } from "../helpers/constants";

export function useMarketContract() {
  return useContract(MARKET_KEY, MARKET_ABI, MARKET_ADDRESS);
}
