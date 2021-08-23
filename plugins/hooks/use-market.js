import { useState, useEffect } from "preact/hooks";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { POLL_INTERVAL } from "../helpers/constants";
import { useContract } from "./";

export function useMarket() {
  const { market, marketAddress } = useContract();
  const [artifacts, setArtifacts] = useState([]);
  const [artifactsPending, setArtifactsPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const artifactsListed = artifacts.filter(
    (artifact) => artifact?.owner?.toLowerCase() === df.account.toLowerCase()
  );

  // store pending artifacts to keep the UI in sync with the chain
  // each update, check if artifact wallet changed, if so remove pending state
  function addArtifactToPending(artifact) {
    setArtifactsPending([...artifactsPending, artifact]);
  }

  function removeArtifactFromPending(artifact) {
    setArtifactsPending(artifactsPending.filter((a) => a.id !== artifact.id));
  }

  const withdrawArtifact = (artifact) => {
    market
      .unlist(BigNumber.from("0x" + artifact.id))
      .then(() => addArtifactToPending(artifact))
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchMarket = () =>
    df.contractsAPI
      .getPlayerArtifacts(marketAddress)
      .then((afx) =>
        Promise.all(
          afx.map(async (artifact) =>
            market
              .listings(BigNumber.from("0x" + artifact.id))
              .then(([owner, priceRaw]) => ({
                ...artifact,
                owner,
                priceRaw,
                price: formatEther(priceRaw),
              }))
              .catch(setError)
          )
        )
      )
      .then((afx) => {
        // check if currentOwner changed or if no longer exists
        const artifactsPendingUpdate = artifactsPending.filter((artifact) => {
          // if either of these occurred, remove from pending
          const artifactUpdate = afx.find((a) => a.id === artifact.id);
          const wasRemoved = !afx.map((a) => a.id).includes(artifact.id);
          const ownerChanged =
            artifactUpdate &&
            artifactUpdate.currentOwner !== artifact.currentOwner;
          if (wasRemoved || ownerChanged) return false;
          else return true;
        });

        // if pending list changed, save it
        if (artifactsPending.length !== artifactsPendingUpdate.length)
          setArtifactsPending(artifactsPendingUpdate);

        // save latest artifacts
        setArtifacts(afx);
      })
      .then(() => setLoading(false))
      .catch(setError);

  useEffect(() => {
    fetchMarket();
    const poll = setInterval(fetchMarket, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, []);

  return {
    data: {
      artifacts,
      artifactsListed,
      artifactsPending,
      artifactsPendingIds: artifactsPending.map((a) => a.id),
      isArtifactOwned: (a) =>
        a.owner?.toLowerCase() === df.account.toLowerCase(),
      isArtifactPending: (a) =>
        artifactsPending.map((b) => b.id).includes(a.id),
      addArtifactToPending,
      removeArtifactFromPending,
      withdrawArtifact,
      contract: market,
      address: marketAddress,
    },
    loading,
    error,
    refetch: fetchMarket,
  };
}
