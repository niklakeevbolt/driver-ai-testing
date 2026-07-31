import tierBronzeBg from '../../assets/rewards/tier-bronze-bg.svg'
import tierBronzeDiamond from '../../assets/rewards/tier-bronze-diamond.svg'
import tierSilverBg from '../../assets/rewards/tier-silver-bg.svg'
import tierSilverDiamond from '../../assets/rewards/tier-silver-diamond.svg'
import tierGoldBg from '../../assets/rewards/tier-gold-bg.svg'
import tierGoldDiamond from '../../assets/rewards/tier-gold-diamond.svg'
import tierPlatinumBg from '../../assets/rewards/tier-platinum-bg.svg'
import tierPlatinumDiamond from '../../assets/rewards/tier-platinum-diamond.svg'
import tierDiamondBg from '../../assets/rewards/tier-diamond-bg.svg'
import tierDiamondDiamond from '../../assets/rewards/tier-diamond-diamond.svg'

const TIER_ASSETS = {
  bronze: { bg: tierBronzeBg, diamond: tierBronzeDiamond },
  silver: { bg: tierSilverBg, diamond: tierSilverDiamond },
  gold: { bg: tierGoldBg, diamond: tierGoldDiamond },
  platinum: { bg: tierPlatinumBg, diamond: tierPlatinumDiamond },
  diamond: { bg: tierDiamondBg, diamond: tierDiamondDiamond },
}

export default function TierRewardsIcon({ tier = 'silver', size = 16, className = '' }) {
  const assets = TIER_ASSETS[tier] ?? TIER_ASSETS.silver
  const sizeClass = size === 24 ? 'size-6' : 'size-4'

  return (
    <span className={`relative inline-block shrink-0 ${sizeClass} ${className}`} aria-hidden="true">
      <img alt="" src={assets.bg} className="absolute inset-0 size-full" />
      <img alt="" src={assets.diamond} className="absolute inset-[12.5%] size-3/4" />
    </span>
  )
}
