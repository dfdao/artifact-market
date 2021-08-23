import { h } from "preact";
import { colors } from "../helpers/constants";

const styles = {
  marginBottom: 16,
  padding: 8,
  color: colors.dfred,
};

export function ErrorLabel({ error }) {
  return error ? <p style={styles}>Error: {error.message}</p> : null;
}
