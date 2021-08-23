import { useContext } from "preact/hooks";
import { TransactionContext } from "../components/TransactionContext";

export const useTransactions = () => {
  const { artifacts, setArtifacts } = useContext(TransactionContext);

  return {
    artifacts,
    setArtifacts,
    addArtifact: (a) => setArtifacts([...artifacts, a]),
    removeArtifact: (a) => setArtifacts(artifacts.filter((b) => b.id !== a.id)),
    isArtifactPending: (a) => artifacts.map((b) => b.id).includes(a.id),
  };
};
