import { h } from "preact";
import { Navigation } from "../components/Navigation";
import { MarketView } from "./MarketView";
import { ListingsView } from "./ListingsView";
import { InventoryView } from "./InventoryView";
import { ContractProvider } from "../components/ContractContext";

export function AppView({ contract }) {
  return (
    <ContractProvider value={contract}>
      <Navigation
        tabs={[
          { name: "Market", TabContent: MarketView },
          { name: "Listings", TabContent: ListingsView },
          { name: "Inventory", TabContent: InventoryView },
        ]}
      />
    </ContractProvider>
  );
}
