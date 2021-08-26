import { request, gql } from 'graphql-request'

const endpoint = process.env.MARKET_SUBGRAPH_ROUND3_URL

const queryToken = gql`
  query ListedToken($id: String!) {
    listedToken(id: $id) {
      id
      tokenID
      price
      owner
    }
  }
`

const queryTokens = gql`
  query ListedTokens(
    $skip: Int!
    $first: Int!
    $orderBy: String!
    $orderDirection: String!
  ) {
    listedTokens(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      tokenID
      price
      owner
    }
  }
`

export async function getListedToken(id) {
  request(endpoint, queryToken, { id })
}

export async function getListedTokens({
  skip = 0,
  first = 50,
  orderBy = 'price',
  orderDirection = 'desc',
}) {
  const { listedTokens } = await request(endpoint, queryTokens, {
    skip,
    first,
    orderBy,
    orderDirection,
  }).catch((err) => {
    throw new Error(err)
  })

  return listedTokens
}

export default { getListedToken, getListedTokens }
