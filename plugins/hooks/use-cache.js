import { useState, useEffect } from "preact/hooks";
import { CACHE_KEY } from "../helpers/constants";

export function useCache() {
  const [cache, setCache] = useState(window[CACHE_KEY] || {});
  const updateCache = (update) => setCache({ ...cache, ...update });

  // when cache is set, save it on the window key
  useEffect(() => {
    window[CACHE_KEY] = cache;
  }, [cache]);

  return [cache, updateCache];
}
