import { colors } from "../helpers/theme";
import { StatIdx, StatNames } from "../helpers/types";

export function getUpgradeStat(upgrade, stat) {
  if (stat === StatIdx.EnergyCap) return upgrade.energyCapMultiplier;
  else if (stat === StatIdx.EnergyGro) return upgrade.energyGroMultiplier;
  else if (stat === StatIdx.Range) return upgrade.rangeMultiplier;
  else if (stat === StatIdx.Speed) return upgrade.speedMultiplier;
  else if (stat === StatIdx.Defense) return upgrade.defMultiplier;
  else return upgrade.energyCapMultiplier;
}

export function formatMultiplierArtifact(artifact, statName) {
  const upgrades = [artifact.upgrade, artifact.timeDelayedUpgrade];
  const stat = StatIdx[StatNames[statName]];
  return formatMultiplierValue({ upgrades, stat });
}

export function formatMultiplierValue({ upgrades, stat }) {
  return upgrades.reduce((mult, upgrade) => {
    if (upgrade) mult *= getUpgradeStat(upgrade, stat) / 100;
    return mult;
  }, 100);
}

export function formatMultiplierText({ upgrades, stat }) {
  const val = formatMultiplierValue({ upgrades, stat });
  if (val === 100) return `+0%`;
  if (val > 100) return `+${Math.round(val) - 100}%`;
  return `-${100 - Math.round(val)}%`;
}

export function formatMultiplierColor(value) {
  if (value === 100) return colors.muted;
  if (value > 100) return colors.dfgreen;
  return colors.dfred;
}

export function formatDateTime(timestamp) {
  if (!timestamp) return 0;
  const date = new Date(timestamp * 1000);
  return `${date.toDateString()} ${date.toLocaleTimeString()}`;
}

const thousand = 1000;
const million = thousand * 1000;
const billion = million * 1000;
const trillion = billion * 1000;
const quadrillion = trillion * 1000;
const quintillion = quadrillion * 1000;

export function formatPrice(numbers = 0) {
  const value = Number(numbers);
  const rounded = Math.round(value);
  const trim = (increment) => Math.round(value / increment);

  if (value < 10) return value.toFixed(2);
  if (value <= thousand) return rounded;
  if (rounded < million) return trim(thousand) + "k";
  if (rounded < billion) return trim(million) + "m";
  if (rounded < trillion) return trim(billion) + "b";
  if (rounded < quadrillion) return trim(trillion) + "t";
  if (rounded < quintillion) return trim(quadrillion) + "q";
  return "???";
}

export function formatCommas(numbers = 0) {
  return numbers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
