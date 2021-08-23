import { h } from "preact";
import { useMarket, useTransactions } from "../hooks";
import { ArtifactsMarket } from "../components/ArtifactsMarket";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { ErrorLabel } from "../components/ErrorLabel";

const styles = {
  display: "grid",
  width: "100%",
  padding: "8px",
  gridRowGap: "16px",
};

export function ListingsView() {
  const { isArtifactPending } = useTransactions();
  const { data, loading, error, withdrawArtifact } = useMarket();

  if (error) return <ErrorLabel error={error} />;
  if (loading) return <Loading />;

  return (
    <div style={styles}>
      <ArtifactsMarket
        title="Artifacts For Sale"
        empty="You don't have any artifacts listed for sale."
        artifacts={data.artifactsListed}
        setActiveArtifact={(artifact) => (
          <Button
            children={
              isArtifactPending(artifact) ? (
                <Loading length={3} padding={0} />
              ) : (
                "withdraw"
              )
            }
            style={{ width: "100%" }}
            onClick={() => withdrawArtifact(artifact)}
            disabled={isArtifactPending(artifact)}
          />
        )}
      />
    </div>
  );
}
