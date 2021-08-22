import { useState, useEffect } from "preact/hooks";
import { useCache } from "./use-cache";

export function useContract(KEY, ABI, ADDRESS) {
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
