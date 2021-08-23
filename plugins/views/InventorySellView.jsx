import { h } from "preact";
import { useState } from "preact/hooks";
import { useApproval, useMarket } from "../hooks";
import { ArtifactsHeaderBuySell } from "../components/ArtifactsHeaderBuySell";
import { ArtifactMarket } from "../components/ArtifactMarket";
import { ArtifactDetails } from "../components/ArtifactDetails";
import { ErrorLabel } from "../components/ErrorLabel";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function InventorySellView({ artifact, setActiveArtifact }) {
  useApproval();
  const { listArtifact } = useMarket();
  const [price, setPrice] = useState(0);
  const [error, setError] = useState();
  const styleInventorySell = { padding: 8 };

  const onClickList = () => {
    listArtifact(artifact, price)
      .then(() => setActiveArtifact(false))
      .catch(setError);
  };

  return (
    <div style={styleInventorySell}>
      <ArtifactsHeaderBuySell />
      <ArtifactMarket artifact={{ ...artifact, price }} />
      <ArtifactDetails artifact={{ ...artifact, price }} />
      <ErrorLabel error={error} />

      <div
        style={{
          display: "grid",
          gridColumnGap: "8px",
          gridAutoFlow: "column",
          placeContent: "center",
        }}
      >
        <Input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={setPrice}
          style={{ width: "128px" }}
        />

        <Button
          theme="green"
          style={{ width: "128px" }}
          children="list"
          onClick={onClickList}
        />

        <Button
          theme="red"
          style={{ width: "128px" }}
          children="cancel"
          onClick={() => setActiveArtifact(false)}
        />
      </div>
    </div>
  );
}
