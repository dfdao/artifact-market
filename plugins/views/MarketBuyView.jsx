import { h } from "preact";
import { useState } from "preact/hooks";
import { useMarket } from "../hooks";
import { Button } from "../components/Button";
import { ArtifactsHeaderBuySell } from "../components/ArtifactsHeaderBuySell";
import { ArtifactMarket } from "../components/ArtifactMarket";
import { ArtifactDetails } from "../components/ArtifactDetails";
import { ErrorLabel } from "../components/ErrorLabel";

export function MarketBuyView({ artifact, setActiveArtifact }) {
  const [error, setError] = useState();
  const { buyArtifact } = useMarket();
  const styleInventoryBuy = { padding: 8 };

  const onClickBuy = () => {
    buyArtifact(artifact)
      .then(() => setActiveArtifact())
      .catch(setError);
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
          onClick={onClickBuy}
          style={{ width: "192px" }}
          children="buy"
        />

        <Button
          theme="red"
          onClick={() => setActiveArtifact()}
          style={{ width: "192px" }}
          children="cancel"
        />
      </div>
    </div>
  );
}
