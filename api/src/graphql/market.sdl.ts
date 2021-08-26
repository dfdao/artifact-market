export const schema = gql`
  type Listing {
    id: String!
    tokenID: String!
    owner: String!
    price: String!
    player: Player
    artifact: Artifact
  }

  type Query {
    listing(id: String!): Listing
    listings(
      skip: Int
      first: Int
      orderBy: String
      orderDirection: String
    ): [Listing!]!
  }
`
