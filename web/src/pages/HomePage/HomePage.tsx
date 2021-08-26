import { MetaTags } from '@redwoodjs/web'
import MarketCell from 'src/components/MarketCell'

const HomePage = () => {
  return (
    <>
      <MetaTags
        title="Artifact Market"
        description="Dark Forest Artifact Market Web dApp"
      />
      <h1>Artifact Market</h1>
      <MarketCell />
    </>
  )
}

export default HomePage
