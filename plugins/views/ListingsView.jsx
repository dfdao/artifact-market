import { h } from "preact";
import { useMarket } from "../hooks/use-market";
import { ArtifactsMarket } from "../components/ArtifactsMarket";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { ErrorLabel } from "../components/ErrorLabel";

export function ListingsView() {
  const { data, loading, error } = useMarket();
  const artifactsStyle = {
    display: "grid",
    width: "100%",
    padding: "8px",
    gridRowGap: "16px",
  };

  if (error) return <ErrorLabel error={error} />;
  if (loading) return <Loading />;

  return (
    <div style={artifactsStyle}>
      <ArtifactsMarket
        title="Artifacts For Sale"
        empty="You don't have any artifacts listed for sale."
        artifacts={data.artifactsListed}
        setActiveArtifact={(artifact) => (
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
        )}
      />
    </div>
  );
}
