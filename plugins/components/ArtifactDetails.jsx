import { h } from "preact";
import { ArtifactRarityNames, BiomeNames } from "@darkforest_eth/types";
import { Detail } from "./Detail";
import { formatDateTime } from "../helpers/format";

const style = {
  margin: "16px auto",
};

export function ArtifactDetails({ artifact }) {
  return (
    <div style={style}>
      <Detail
        title="rarity"
        description={ArtifactRarityNames[artifact.rarity]}
      />

      <Detail title="biome" description={BiomeNames[artifact.planetBiome]} />

      <Detail title="seller" description={artifact.owner || df.account} />
      <Detail title="discoverer" description={artifact.discoverer} />

      <Detail
        title="discovered"
        description={formatDateTime(artifact.mintedAtTimestamp) || "never"}
      />

      <Detail
        title="last activated"
        description={formatDateTime(artifact.lastActivated) || "never"}
      />

      <Detail
        title="last deactivated"
        description={formatDateTime(artifact.lastDeactivated) || "never"}
      />

      <Detail title="price" description={`${artifact.price} xDai`} />
    </div>
  );
}
