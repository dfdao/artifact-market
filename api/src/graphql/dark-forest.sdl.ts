export const schema = gql`
  type Player {
    id: ID!
    initTimestamp: Int!
    homeWorld: Planet
    milliScore: String!
    score: String!
    lastRevealTimestamp: Int!
    planets: [Planet!]!
    sentVoyages: [Arrival!]!
    artifactsDiscovered: [Artifact!]!
    # "NOTE: Does not reflect deposited artifacts now 'owned' by the game contract"
    artifactsWithdrawn: [Artifact!]!
  }

  type Planet {
    # "locationId: 0 padded hex value of locationDec, no 0x prefix"
    id: ID!
    # "decimal version of locationid"
    locationDec: String!
    owner: Player!
    isInitialized: Boolean!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    createdAt: Int!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    lastUpdated: Int!
    perlin: Int!
    range: Int!
    # "Value divided by 100 for percentage. Less than 100 is negative"
    speed: Int!
    # "Value divided by 100 for percentage. Less than 100 is negative"
    defense: Int!
    # "NOTE: This needs to be divided by 1000. NOTE: This is stored lazily and needs to be updated from lastUpdated to current time"
    milliEnergyLazy: String!
    # "NOTE: This needs to be divided by 1000"
    milliEnergyCap: String!
    # "NOTE: This needs to be divided by 1000"
    milliEnergyGrowth: String!
    # "NOTE: This needs to be divided by 1000. NOTE: This is stored lazily and needs to be updated from lastUpdated to current time"
    milliSilverLazy: String!
    # "NOTE: This needs to be divided by 1000"
    milliSilverCap: String!
    # "NOTE: This needs to be divided by 1000"
    milliSilverGrowth: String!
    planetLevel: Int!
    defenseUpgrades: Int!
    rangeUpgrades: Int!
    speedUpgrades: Int!
    isEnergyCapBoosted: Boolean!
    isEnergyGrowthBoosted: Boolean!
    isRangeBoosted: Boolean!
    isSpeedBoosted: Boolean!
    isDefenseBoosted: Boolean!
    hatLevel: Int!
    planetType: PlanetType!
    spaceType: SpaceType!
    destroyed: Boolean!
    isHomePlanet: Boolean!
    hat: Hat

    # revealed coords
    # "Whether this planet's location has been revealed"
    isRevealed: Boolean!
    # "planet's x coordinate, if revealed"
    x: Int
    # "planet's y coordinate, if revealed"
    y: Int
    revealer: Player
    # artifacts
    hasTriedFindingArtifact: Boolean!
    prospectedBlockNumber: Int
    artifacts: [Artifact!]!
    activatedArtifact: Artifact
    incomingWormholes: [Artifact!]!
    # voyages
    voyagesFrom: [Arrival!]!
    voyagesTo: [Arrival!]!
  }
  # "Scheduled arrivals by arrival blocktime"
  type ArrivalQueue {
    # "decimal arrivalTime in seconds as a string"
    id: ID!
    arrivals: [Arrival!]!
  }
  # "Internal type to store internal variables"
  type Meta {
    id: ID!
    # "the last block timestamp in seconds that was processed"
    lastProcessed: Int!
    # "last block number processed"
    blockNumber: Int!
    # "Internal use only: the planet IDs we need to refresh with contract data"
    _currentlyRefreshingPlanets: [String!]!
    # "Internal use only: the artifact IDs we need to refresh with contract data"
    _currentlyRefreshingArtifacts: [String!]!
    # "Internal use only: the voyage IDs we need to refresh with contract data"
    _currentlyAddingVoyages: [String!]!
  }

  type Arrival {
    # "decimal arrivalid as a string"
    id: ID!
    # "same as id, but sortable because its an int"
    arrivalId: Int!
    player: Player!
    fromPlanet: Planet!
    toPlanet: Planet!
    # "NOTE: This needs to be divided by 1000"
    milliEnergyArriving: String!
    # "NOTE: This needs to be divided by 1000"
    milliSilverMoved: String!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    departureTime: Int!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    arrivalTime: Int!
    # "Type of the arrival"
    arrivalType: ArrivalType!
    # "Distance traveled"
    distance: Int!
    carriedArtifact: Artifact
    # "whether this arrival has already been applied"
    arrived: Boolean!
  }
  type Hat {
    # "0 padded hex version of locationDec, no 0x prefix"
    id: ID!
    # "same as id, but linked to planet"
    planet: Planet!
    hatLevel: Int!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    purchaseTimestamps: [Int!]!
    purchasers: [ID!]! # these are eth addresses
  }
  enum PlanetType {
    PLANET
    SILVER_MINE
    RUINS
    TRADING_POST
    SILVER_BANK
  }
  enum PlanetEventType {
    ARRIVAL
  }
  enum SpaceType {
    NEBULA
    SPACE
    DEEP_SPACE
    DEAD_SPACE
  }
  type Artifact {
    # "0 padded hex, no 0x prefix, recommend sorting using mintedAtTimestamp"
    id: ID!
    # "decimal version of artifact ID"
    idDec: String!
    planetDiscoveredOn: Planet
    rarity: ArtifactRarity!
    planetBiome: Biome!
    # "Seconds since epoch, needs to be multiplied by 1000 for javascript representation"
    mintedAtTimestamp: Int!
    discoverer: Player!
    artifactType: ArtifactType!
    lastActivated: Int!
    lastDeactivated: Int!
    isActivated: Boolean!
    wormholeTo: Planet
    # "Modifier applied to natural planet variable. Less than 100 is negative"
    energyCapMultiplier: Int!
    # "Modifier applied to natural planet variable. Less than 100 is negative"
    energyGrowthMultiplier: Int!
    # "Modifier applied to natural planet variable. Less than 100 is negative"
    rangeMultiplier: Int!
    # "Modifier applied to natural planet variable. Less than 100 is negative"
    speedMultiplier: Int!
    # "Modifier applied to natural planet variable. Less than 100 is negative"
    defenseMultiplier: Int!
    owner: Player!
    onPlanet: Planet
    onVoyage: Arrival
  }
  enum ArtifactType {
    UNKNOWN
    MONOLITH
    COLOSSUS
    SPACESHIP
    PYRAMID
    WORMHOLE
    PLANETARYSHIELD
    PHOTOIDCANNON
    BLOOMFILTER
    BLACKDOMAIN
  }
  enum Biome {
    UNKNOWN
    OCEAN
    FOREST
    GRASSLAND
    TUNDRA
    SWAMP
    DESERT
    ICE
    WASTELAND
    LAVA
    CORRUPTED
  }
  enum ArtifactRarity {
    UNKNOWN
    COMMON
    RARE
    EPIC
    LEGENDARY
    MYTHIC
  }
  enum ArrivalType {
    UNKNOWN
    NORMAL
    PHOTOID
    WORMHOLE
  }
`
