import { h } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { ArtifactsHeaderBuySell } from "../components/ArtifactsHeaderBuySell";
import { ArtifactMarket } from "../components/ArtifactMarket";
import { ArtifactDetails } from "../components/ArtifactDetails";
import { ErrorLabel } from "../components/ErrorLabel";
import { BigNumber } from "@ethersproject/bignumber";

export function MarketBuyView({ artifact, setActiveArtifact, market }) {
  const [error, setError] = useState();
  const styleInventoryBuy = { padding: 8 };

  const buyArtifact = () => {
    market.data.marketContract?.contract
      .buy(BigNumber.from("0x" + artifact.id), {
        value: artifact.priceRaw,
        gasLimit: 250000,
      })
      .then(() => {
        market.data.addArtifactToPending(artifact);
        setActiveArtifact(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err);
      }); // catch error (in case of tx failure or something else)
  };

  return (
    <div style={styleInventoryBuy}>
      <ArtifactsHeaderBuySell />
      <ArtifactMarket artifact={artifact} />
      <ArtifactDetails artifact={artifact} />
      <ErrorLabel error={error} />

      <div
        style={{
          display: "grid",
          gridColumnGap: "8px",
          gridAutoFlow: "column",
          placeContent: "center",
        }}
      >
        <Button
          theme="green"
          onClick={buyArtifact}
          style={{ width: "192px" }}
          children="buy"
        />

        <Button
          theme="red"
          onClick={() => setActiveArtifact(false)}
          style={{ width: "192px" }}
          children="cancel"
        />
      </div>
    </div>
  );
}
