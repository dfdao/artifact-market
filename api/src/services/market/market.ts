import { getListedToken, getListedTokens } from 'src/lib/market'
import { getArtifactsByIds } from 'src/lib/artifact'

export const beforeResolver = (rules) => {
  rules.skip({ only: ['listings'] })
}

export const listing = ({ id }) => {
  return getListedToken(id)
}

export const listings = async ({ skip, first, orderBy, orderDirection }) => {
  const listedTokens = await getListedTokens({
    skip,
    first,
    orderBy,
    orderDirection,
  })
  const tokenIDs = listedTokens.map((entry) => entry.tokenID)
  const artifacts = await getArtifactsByIds(tokenIDs)
  const listings = listedTokens.map((listing) => {
    const artifact = artifacts.find((a) => a.idDec === listing.tokenID)
    return { ...listing, artifact }
  })

  return listings
}
