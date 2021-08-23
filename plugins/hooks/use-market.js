import { useState, useEffect } from "preact/hooks";
import { BigNumber } from "@ethersproject/bignumber";
import { parseEther, formatEther } from "@ethersproject/units";
import { POLL_INTERVAL } from "../helpers/constants";
import { useContract, useTransactions } from "./";

export function useMarket() {
  const { market, marketAddress } = useContract();
  const transactions = useTransactions();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const artifactsListed = artifacts.filter(
    (artifact) => artifact?.owner?.toLowerCase() === df.account.toLowerCase()
  );

  const buyArtifact = (artifact) => {
    return market
      .buy(BigNumber.from("0x" + artifact.id), {
        value: artifact.priceRaw,
        gasLimit: 250000,
      })
      .then(() => transactions.addArtifact(artifact));
  };

  const listArtifact = (artifact, price) => {
    return market
      .list(BigNumber.from("0x" + artifact.id), parseEther(price.toString()), {
        gasLimit: 250000,
      })
      .then(() => transactions.addArtifact(artifact));
  };

  const withdrawArtifact = (artifact) => {
    market
      .unlist(BigNumber.from("0x" + artifact.id))
      .then(() => transactions.addArtifact(artifact))
      .catch(setError);
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
        const transactionsUpdate = transactions.artifacts.filter((artifact) => {
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
        if (transactions.artifacts.length !== transactionsUpdate.length)
          transactions.setArtifacts(transactionsUpdate);

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
    },
    loading,
    error,
    refetch: fetchMarket,
    isArtifactOwned: (a) => a.owner?.toLowerCase() === df.account.toLowerCase(),
    buyArtifact,
    listArtifact,
    withdrawArtifact,
    contract: market,
    address: marketAddress,
  };
}
