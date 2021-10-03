/* eslint-disable eqeqeq */
import { BigInt} from '@graphprotocol/graph-ts';
import { DarkForestGetters__bulkGetArtifactsByIdsResultRetStruct } from '../../generated/DarkForestCore/DarkForestGetters';
import { TokenSale,CurrentListing } from '../../generated/schema';
import {
  hexStringToPaddedUnprefixed,
  toArtifactRarity,
  toArtifactType,
  toBiome
} from './converters';



export function getSaleFromContractData(
  saleId: string,
  rawArtifact: DarkForestGetters__bulkGetArtifactsByIdsResultRetStruct
): TokenSale {

  let artifact = new TokenSale(saleId);

  artifact.rarity = toArtifactRarity(rawArtifact.artifact.rarity);
  artifact.planetBiome = toBiome(rawArtifact.artifact.planetBiome);
  artifact.artifactType = toArtifactType(rawArtifact.artifact.artifactType);

  artifact.energyCapMultiplier = rawArtifact.upgrade.popCapMultiplier.toI32();
  artifact.energyGrowthMultiplier = rawArtifact.upgrade.popGroMultiplier.toI32();
  artifact.rangeMultiplier = rawArtifact.upgrade.rangeMultiplier.toI32();
  artifact.speedMultiplier = rawArtifact.upgrade.speedMultiplier.toI32();
  artifact.defenseMultiplier = rawArtifact.upgrade.defMultiplier.toI32();

  return artifact;
}

export function getListFromContractData(
    artifactIdDec: BigInt,
    rawArtifact: DarkForestGetters__bulkGetArtifactsByIdsResultRetStruct
  ): CurrentListing {
    const artifactId = hexStringToPaddedUnprefixed(artifactIdDec.toHexString());
  
    let artifact = CurrentListing.load(artifactId);
    if (!artifact) artifact = new CurrentListing(artifactId);
  
    artifact.idDec = artifactIdDec;
    artifact.rarity = toArtifactRarity(rawArtifact.artifact.rarity);
    artifact.planetBiome = toBiome(rawArtifact.artifact.planetBiome);
    artifact.artifactType = toArtifactType(rawArtifact.artifact.artifactType);
  
    artifact.energyCapMultiplier = rawArtifact.upgrade.popCapMultiplier.toI32();
    artifact.energyGrowthMultiplier = rawArtifact.upgrade.popGroMultiplier.toI32();
    artifact.rangeMultiplier = rawArtifact.upgrade.rangeMultiplier.toI32();
    artifact.speedMultiplier = rawArtifact.upgrade.speedMultiplier.toI32();
    artifact.defenseMultiplier = rawArtifact.upgrade.defMultiplier.toI32();

    return artifact;
  }