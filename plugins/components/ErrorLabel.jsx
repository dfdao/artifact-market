import { h } from "preact";
import { colors } from "../helpers/constants";

const styles = {
  margin: "16px 0",
  color: colors.dfred,
};

export function ErrorLabel({ error }) {
  return error ? <p style={styles}>Error: {error.message}</p> : null;
}
