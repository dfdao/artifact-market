import { h } from "preact";
import { useState } from "preact/hooks";
import { useWallet } from "../hooks/use-wallet";
import { colors } from "../helpers/constants";
import { MarketView } from "./MarketView";
import { ListingsView } from "./ListingsView";
import { InventoryView } from "./InventoryView";
import { Button } from "../components/Button";

const styles = {
  container: {
    position: "relative",
    height: "100%",
  },
  content: {
    paddingBottom: "44px",
    height: "100%",
    overflowY: "scroll",
  },
  tabs: {
    display: "grid",
    position: "absolute",
    padding: "8px",
    gridColumnGap: "8px",
    justifyContent: "flex-start",
    gridTemplateColumns: "auto auto auto 1fr",
    alignItems: "center",
    bottom: 0,
    width: "100%",
    background: colors.background,
    borderTop: `1px solid ${colors.borderlight}`,
  },
};

const TabsType = {
  market: 0,
  listings: 1,
  inventory: 2,
};

const TabsTypeNames = {
  [0]: "Market",
  [1]: "Listings",
  [2]: "Inventory",
};

export function AppView() {
  const [activeTab, setActiveTab] = useState(TabsType.market);
  const { balanceShort } = useWallet();

  const styleTab = (isActive) => ({
    color: isActive ? colors.dfwhite : colors.muted,
    background: colors.background,
  });

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {TabsType.market === activeTab && <MarketView />}
        {TabsType.listings === activeTab && <ListingsView />}
        {TabsType.inventory === activeTab && <InventoryView />}
      </div>
      <div style={styles.tabs}>
        <Button
          style={styleTab(TabsType.market === activeTab)}
          onClick={() => setActiveTab(TabsType.market)}
          children={TabsTypeNames[0]}
        />
        <Button
          style={styleTab(TabsType.listings === activeTab)}
          onClick={() => setActiveTab(TabsType.listings)}
          children={TabsTypeNames[1]}
        />
        <Button
          style={styleTab(TabsType.inventory === activeTab)}
          onClick={() => setActiveTab(TabsType.inventory)}
          children={TabsTypeNames[2]}
        />
        <div style={{ textAlign: "right" }}>
          <Button
            style={{ ...styleTab(), marginLeft: "auto", cursor: "auto" }}
            children={TabsTypeNames[2]}
            disabled
          >
            {balanceShort} xDai
          </Button>
        </div>
      </div>
    </div>
  );
}
