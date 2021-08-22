import { h } from "preact";
import { ArtifactSortType } from "../helpers/types";
import { colors } from "../helpers/constants";
import { ArtifactHeaderButton } from "./ArtifactHeaderButton";
import { Input } from "./Input";
import {
  EnergySVG,
  EnergyGrowthSVG,
  RangeSVG,
  SpeedSVG,
  DefenseSVG,
  PriceSVG,
} from "./Icon";

const style = {
  header: {
    display: "grid",
    marginBottom: "4px",
    gridTemplateColumns: "2.75fr 1fr 1fr 1fr 1fr 1fr 1fr 1.75fr",
    gridColumnGap: "8px",
    textAlign: "center",
  },
};

export function ArtifactsHeaderMarket(props) {
  const color = (type) => {
    if (props.sort === type && props.reverse) return colors.dfred;
    if (props.sort === type) return colors.dfgreen;
    return colors.muted;
  };

  const sortBy = (type) => () => {
    if (props.reverse) return props.clear();
    if (props.sort === type) return props.setReverse(true);
    return props.setSort(type);
  };

  return (
    <div style={style.header}>
      <ArtifactHeaderButton
        style={{
          justifyContent: "flex-start",
          color: color(ArtifactSortType.type),
        }}
        onClick={sortBy(ArtifactSortType.type)}
        children="Artifact"
      />

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.energy)}>
        <EnergySVG color={color(ArtifactSortType.energy)} />
      </ArtifactHeaderButton>

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.energyGrowth)}>
        <EnergyGrowthSVG color={color(ArtifactSortType.energyGrowth)} />
      </ArtifactHeaderButton>

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.range)}>
        <RangeSVG color={color(ArtifactSortType.range)} />
      </ArtifactHeaderButton>

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.speed)}>
        <SpeedSVG color={color(ArtifactSortType.speed)} />
      </ArtifactHeaderButton>

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.defense)}>
        <DefenseSVG color={color(ArtifactSortType.defense)} />
      </ArtifactHeaderButton>

      <ArtifactHeaderButton onClick={sortBy(ArtifactSortType.price)}>
        <PriceSVG color={color(ArtifactSortType.price)} />
      </ArtifactHeaderButton>

      <Input
        type="search"
        placeholder="search..."
        value={props.filter}
        onChange={props.setFilter}
        style={{ width: "100%", fontSize: 12 }}
      />
    </div>
  );
}
