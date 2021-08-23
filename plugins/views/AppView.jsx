import { h } from "preact";
import { Navigation } from "../components/Navigation";
import { MarketView } from "./MarketView";
import { ListingsView } from "./ListingsView";
import { InventoryView } from "./InventoryView";
import { HelpView } from "./HelpView";
import { ContractProvider } from "../components/ContractContext";
import { TransactionProvider } from "../components/TransactionContext";

export function AppView({ contract }) {
  return (
    <ContractProvider value={contract}>
      <TransactionProvider>
        <Navigation
          tabs={[
            { name: "Market", TabContent: MarketView },
            { name: "Listings", TabContent: ListingsView },
            { name: "Inventory", TabContent: InventoryView },
            { name: "Help", TabContent: HelpView },
          ]}
        />
      </TransactionProvider>
    </ContractProvider>
  );
}
