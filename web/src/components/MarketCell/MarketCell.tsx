export const QUERY = gql`
  query listings(
    $skip: Int
    $first: Int
    $orderBy: String
    $orderDirection: String
  ) {
    listings(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      tokenID
      price
      owner
      artifact {
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
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

function Listing(props) {
  return (
    <div>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  )
}

export const Success = ({ listings }) => {
  return (
    <div>
      {listings.map((listing) => (
        <Listing key={listing.id} {...listing} />
      ))}
    </div>
  )
}
