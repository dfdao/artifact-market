/* eslint-disable eqeqeq */
import { BigInt} from '@graphprotocol/graph-ts';
//import { DarkForestTokens__getArtifactResultValue0Struct } from '../../generated/MarketEvents/DarkForestTokens';
import { DarkForestGetters__bulkGetArtifactsByIdsResultRetStruct } from '../../generated/MarketEvents/DarkForestGetters'
import { CurrentListing } from '../../generated/schema';
import {
  hexStringToPaddedUnprefixed,
  toArtifactRarity,
  toArtifactType,
  toBiome
} from './converters';

/*
export function getListFromContractData(
    artifactIdDec: BigInt,
    rawArtifact: DarkForestTokens__getArtifactResultValue0Struct
  ): CurrentListing {
    let artifactId = hexStringToPaddedUnprefixed(artifactIdDec.toHexString());
  
    let artifact = CurrentListing.load(artifactId);
    if (!artifact) artifact = new CurrentListing(artifactId);
  
    artifact.idDec = artifactIdDec;
    artifact.rarity = toArtifactRarity(rawArtifact.rarity);
    artifact.planetBiome = toBiome(rawArtifact.planetBiome);
    artifact.artifactType = toArtifactType(rawArtifact.artifactType);
  
    return artifact as CurrentListing;
}
*/
export function getListFromContractData(
  artifactIdDec: BigInt,
  rawArtifact: DarkForestGetters__bulkGetArtifactsByIdsResultRetStruct[]
): CurrentListing {
  let artifactId = hexStringToPaddedUnprefixed(artifactIdDec.toHexString());

  let artifact = CurrentListing.load(artifactId);
  if (!artifact) artifact = new CurrentListing(artifactId);

  artifact.idDec = artifactIdDec;
  artifact.rarity = toArtifactRarity(rawArtifact[0].artifact.rarity);
  artifact.planetBiome = toBiome(rawArtifact[0].artifact.planetBiome);
  artifact.artifactType = toArtifactType(rawArtifact[0].artifact.artifactType);

  return artifact as CurrentListing;
}
