import { h } from "preact";
import { useState } from "preact/hooks";
import { useTransactions, useInventory } from "../hooks";
import { ArtifactsInventory } from "../components/ArtifactsInventory";
import { Loading } from "../components/Loading";
import { Button } from "../components/Button";
import { ErrorLabel } from "../components/ErrorLabel";
import { InventorySellView } from "./InventorySellView";

export function InventoryView() {
  const { isArtifactPending } = useTransactions();
  const { data, loading, error } = useInventory();
  const [activeArtifact, setActiveArtifact] = useState(false);
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  if (error) return <ErrorLabel error={error} />;
  if (loading) return <Loading />;

  if (activeArtifact)
    return (
      <InventorySellView
        artifact={activeArtifact}
        setActiveArtifact={setActiveArtifact}
      />
    );

  return (
    <div style={artifactsStyle}>
      <ArtifactsInventory
        title="Your Artifacts"
        empty="You don't currently have any artifacts in your inventory. Withdraw them from spacetime rips or buy some from the market."
        artifacts={data.artifacts}
        setActiveArtifact={(artifact) => {
          return (
            <Button
              children={
                isArtifactPending(artifact) ? (
                  <Loading length={3} padding={0} />
                ) : (
                  "view"
                )
              }
              style={{ width: "100%" }}
              onClick={() => setActiveArtifact(artifact)}
              disabled={isArtifactPending(artifact)}
            />
          );
        }}
      />
    </div>
  );
}
