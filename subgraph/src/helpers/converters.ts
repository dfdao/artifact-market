/* eslint-disable eqeqeq */

// BigInt does not get 0 padded by toHexString plus gets a 0x prefix...
export function hexStringToPaddedUnprefixed(prefixed: string): string {
  // strip 0x
  let stripped = prefixed.substring(2, prefixed.length);
  // pad to 64
  let padded = stripped.padStart(64, '0');
  return padded;
}

export function toArtifactType(artifactType: i32): string {
  if (artifactType === 1) {
    return 'MONOLITH';
  } else if (artifactType === 2) {
    return 'COLOSSUS';
  } else if (artifactType === 3) {
    return 'SPACESHIP';
  } else if (artifactType === 4) {
    return 'PYRAMID';
  } else if (artifactType === 5) {
    return 'WORMHOLE';
  } else if (artifactType === 6) {
    return 'PLANETARYSHIELD';
  } else if (artifactType === 7) {
    return 'PHOTOIDCANNON';
  } else if (artifactType === 8) {
    return 'BLOOMFILTER';
  } else if (artifactType === 9) {
    return 'BLACKDOMAIN';
  } else {
    return 'UNKNOWN';
  }
}

export function toArtifactRarity(rarity: i32): string {
  if (rarity === 1) {
    return 'COMMON';
  } else if (rarity === 2) {
    return 'RARE';
  } else if (rarity === 3) {
    return 'EPIC';
  } else if (rarity === 4) {
    return 'LEGENDARY';
  } else if (rarity === 5) {
    return 'MYTHIC';
  } else {
    return 'UNKNOWN';
  }
}

export function toBiome(biome: i32): string {
  if (biome === 1) {
    return 'OCEAN';
  } else if (biome === 2) {
    return 'FOREST';
  } else if (biome === 3) {
    return 'GRASSLAND';
  } else if (biome === 4) {
    return 'TUNDRA';
  } else if (biome === 5) {
    return 'SWAMP';
  } else if (biome === 6) {
    return 'DESERT';
  } else if (biome === 7) {
    return 'ICE';
  } else if (biome === 8) {
    return 'WASTELAND';
  } else if (biome === 9) {
    return 'LAVA';
  } else if (biome === 10) {
    return 'CORRUPTED';
  } else {
    return 'UNKNOWN';
  }
}
