import { useState, useEffect } from "preact/hooks";
import { getMyBalance, subscribeToMyBalance } from "../helpers/wallet";

export function useWallet() {
  const [balance, setBalance] = useState(getMyBalance);

  useEffect(() => {
    const sub = subscribeToMyBalance(setBalance);
    return sub.unsubscribe;
  }, [setBalance]);

  return { balance, balanceShort: Number.parseFloat(balance).toFixed(2) };
}
