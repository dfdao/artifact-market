import { request, gql } from 'graphql-request'

const endpoint = process.env.DARKFOREST_SUBGRAPH_ROUND3_URL

const queryArtifact = gql`
  query Artifact($id: String!) {
    artifact(id: $id) {
      id
      idDec
      planetDiscoveredOn {
        id
      }
      rarity
      planetBiome
      mintedAtTimestamp
      discoverer {
        id
      }
      artifactType
      lastActivated
      lastDeactivated
      energyCapMultiplier
      energyGrowthMultiplier
      rangeMultiplier
      speedMultiplier
      defenseMultiplier
    }
  }
`

const queryArtifactsByIds = gql`
  query queryArtifacts($ids: [ID!]!) {
    artifacts(where: { idDec_in: $ids }) {
      id
      idDec
      planetDiscoveredOn {
        id
      }
      rarity
      planetBiome
      mintedAtTimestamp
      discoverer {
        id
      }
      artifactType
      lastActivated
      lastDeactivated
      energyCapMultiplier
      energyGrowthMultiplier
      rangeMultiplier
      speedMultiplier
      defenseMultiplier
    }
  }
`

export async function getArtifact(id) {
  const { artifact } = await request(endpoint, queryArtifact, { id }).catch(
    (err) => {
      throw new Error(err)
    }
  )
  return artifact
}

export async function getArtifactsByIds(ids) {
  const { artifacts } = await request(endpoint, queryArtifactsByIds, {
    ids,
  }).catch((err) => {
    throw new Error(err)
  })

  return artifacts
}

export default { getArtifact, getArtifactsByIds }
