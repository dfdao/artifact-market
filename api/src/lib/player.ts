import { request, gql } from 'graphql-request'

const endpoint = process.env.DARKFOREST_SUBGRAPH_ROUND3_URL

const queryPlayer = gql`
  query Player($id: String!) {
    player(id: $id) {
      id
      initTimestamp
      artifactsWithdrawn {
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
        owner {
          id
        }
      }
    }
  }
`

const queryPlayers = gql`
  query queryPlayers(
    $skip: Int!
    $first: Int!
    $orderBy: String!
    $orderDirection: String!
  ) {
    players(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      initTimestamp
      artifactsWithdrawn {
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
        owner {
          id
        }
      }
    }
  }
`
// TODO: add twitter handles
export async function getPlayer(id) {
  const { player } = await request(endpoint, queryPlayer, { id }).catch(
    (err) => {
      throw new Error(err)
    }
  )
  return player
}

export async function getPlayers({
  skip = 0,
  first = 50,
  orderBy = 'initTimestamp',
  orderDirection = 'desc',
}) {
  const { listedTokens } = await request(endpoint, queryPlayers, {
    skip,
    first,
    orderBy,
    orderDirection,
  }).catch((err) => {
    throw new Error(err)
  })

  return listedTokens
}
