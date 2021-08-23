import { h } from "preact";
import { createContext } from "preact";
import { useState } from "preact/hooks";

export const TransactionContext = createContext([]);

export const TransactionProvider = (props) => {
  const [artifacts, setArtifacts] = useState([]);

  return (
    <TransactionContext.Provider
      value={{ artifacts, setArtifacts }}
      children={props.children}
    />
  );
};
