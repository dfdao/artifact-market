import { h } from "preact";
import { colors } from "../helpers/constants";
import { useState } from "preact/hooks";

export function Button({
  children,
  style,
  theme = "default",
  onClick,
  disabled,
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <button
      style={{ ...styleButton(theme, isActive, disabled), ...style }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function styleButton(theme, isActive, disabled) {
  const styleBase = {
    padding: "2px 8px",
    border: 0,
    color: isActive ? colors.gray.dfblack : colors.gray,
    outline: "none",
    cursor: disabled ? "default" : "pointer",
  };

  return { ...styleBase, ...themeButton(theme, isActive) };
}

function themeButton(theme, isActive) {
  switch (theme) {
    case "blue":
    case "info":
      return {
        background: isActive ? colors.dfblue : colors.backgrounddark,
      };
    case "yellow":
    case "warning":
      return {
        background: isActive ? colors.dfyellow : colors.backgrounddark,
      };
    case "green":
    case "success":
      return {
        background: isActive ? colors.dfgreen : colors.backgrounddark,
      };
    case "red":
    case "danger":
      return {
        background: isActive ? colors.dfred : colors.backgrounddark,
      };
    case "gray":
    case "default":
    default:
      return {
        background: isActive ? colors.muted : colors.backgrounddark,
      };
  }
}
