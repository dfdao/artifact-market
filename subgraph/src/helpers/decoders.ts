/* eslint-disable eqeqeq */
import { BigInt} from '@graphprotocol/graph-ts';
import { DarkForestTokens__getArtifactResultValue0Struct } from '../../generated/templates/MarketEvents/DarkForestTokens';
import { DarkForestGetters__getArtifactByIdResultRetStruct } from '../../generated/Market/DarkForestGetters'
import { TokenSale,CurrentListing } from '../../generated/schema';
import {
  hexStringToPaddedUnprefixed,
  toArtifactRarity,
  toArtifactType,
  toBiome
} from './converters';


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

export function getListFromGetterContractData(
  artifactIdDec: BigInt,
  rawArtifact: DarkForestGetters__getArtifactByIdResultRetStruct
): CurrentListing {
  let artifactId = hexStringToPaddedUnprefixed(artifactIdDec.toHexString());

  let artifact = CurrentListing.load(artifactId);
  if (!artifact) artifact = new CurrentListing(artifactId);

  artifact.idDec = artifactIdDec;
  artifact.rarity = toArtifactRarity(rawArtifact.artifact.rarity);
  artifact.planetBiome = toBiome(rawArtifact.artifact.planetBiome);
  artifact.artifactType = toArtifactType(rawArtifact.artifact.artifactType);

  return artifact as CurrentListing;
}