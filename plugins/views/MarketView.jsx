import { h } from "preact";
import { useState } from "preact/hooks";
import { useMarket } from "../hooks/use-market";
import { ArtifactsMarket } from "../components/ArtifactsMarket";
import { MarketBuyView } from "./MarketBuyView";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { ErrorLabel } from "../components/ErrorLabel";

export function MarketView() {
  const { data, loading, error } = useMarket();
  const [activeArtifact, setActiveArtifact] = useState(false);
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  if (activeArtifact)
    return (
      <MarketBuyView
        artifact={activeArtifact}
        setActiveArtifact={setActiveArtifact}
        market={{ data, loading, error }}
      />
    );

  if (error) return <ErrorLabel error={error} />;
  if (loading) return <Loading />;

  return (
    <div style={artifactsStyle}>
      <ArtifactsMarket
        title="Artifacts For Sale"
        empty="There aren't currently any artifacts listed for sale."
        artifacts={data.artifacts}
        setActiveArtifact={(artifact) =>
          data.isArtifactOwned(artifact) ? (
            <Button
              children={
                data.isArtifactPending(artifact) ? (
                  <Loading length={3} padding={0} />
                ) : (
                  "withdraw"
                )
              }
              style={{ width: "100%" }}
              onClick={() => data.withdrawArtifact(artifact)}
              disabled={data.isArtifactPending(artifact)}
            />
          ) : (
            <Button
              children={
                data.isArtifactPending(artifact) ? (
                  <Loading length={3} padding={0} />
                ) : (
                  "view"
                )
              }
              style={{ width: "100%" }}
              onClick={() => setActiveArtifact(artifact)}
              disabled={data.isArtifactPending(artifact)}
            />
          )
        }
      />
    </div>
  );
}
