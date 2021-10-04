/* eslint-disable eqeqeq */
import { BigInt} from '@graphprotocol/graph-ts';
import { DarkForestTokens__getArtifactResultValue0Struct } from '../../generated/Market/DarkForestTokens';
import { TokenSale,CurrentListing } from '../../generated/schema';
import {
  hexStringToPaddedUnprefixed,
  toArtifactRarity,
  toArtifactType,
  toBiome
} from './converters';



export function getSaleFromContractData(
  saleId: string,
  rawArtifact: DarkForestTokens__getArtifactResultValue0Struct
): TokenSale {

  let artifact = new TokenSale(saleId);

  artifact.rarity = toArtifactRarity(rawArtifact.rarity);
  artifact.planetBiome = toBiome(rawArtifact.planetBiome);
  artifact.artifactType = toArtifactType(rawArtifact.artifactType);

  return artifact;
}

export function getListFromContractData(
    artifactIdDec: BigInt,
    rawArtifact: DarkForestTokens__getArtifactResultValue0Struct
  ): CurrentListing {
    const artifactId = hexStringToPaddedUnprefixed(artifactIdDec.toHexString());
  
    let artifact = CurrentListing.load(artifactId);
    if (!artifact) artifact = new CurrentListing(artifactId);
  
    artifact.idDec = artifactIdDec;
    artifact.rarity = toArtifactRarity(rawArtifact.rarity);
    artifact.planetBiome = toBiome(rawArtifact.planetBiome);
    artifact.artifactType = toArtifactType(rawArtifact.artifactType);
  
    return artifact as CurrentListing;
  }