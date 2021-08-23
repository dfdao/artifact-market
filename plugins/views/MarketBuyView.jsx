import { h } from "preact";
import { useState } from "preact/hooks";
import { useMarket, useWallet } from "../hooks";
import { Button } from "../components/Button";
import { ArtifactsHeaderBuySell } from "../components/ArtifactsHeaderBuySell";
import { ArtifactMarket } from "../components/ArtifactMarket";
import { ArtifactDetails } from "../components/ArtifactDetails";
import { ErrorLabel } from "../components/ErrorLabel";

export function MarketBuyView({ artifact, setActiveArtifact }) {
  const { balance } = useWallet();
  const [error, setError] = useState();
  const [confirm, setConfirm] = useState(false);
  const { buyArtifact } = useMarket();
  const styleInventoryBuy = { padding: 8 };
  const insufficientFunds = balance < artifact.price;

  const onClickConfirm = () => setConfirm(true);
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
          theme={confirm ? "green" : "default"}
          disabled={insufficientFunds}
          onClick={confirm ? onClickBuy : onClickConfirm}
          style={{ width: "192px" }}
          children={buttonBuyText({ confirm, insufficientFunds })}
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

function buttonBuyText({ confirm, insufficientFunds }) {
  if (insufficientFunds) return "insufficient funds";
  if (confirm) return "execute buy";
  return "buy";
}
