import { motion, AnimatePresence } from 'motion/react'
import { IconView } from '@ui'
import {
  CampaignsMenuIcon,
  EarningsMenuIcon,
  LogOutMenuIcon,
  ProfilePlaceholderIcon,
  ScheduledRidesMenuIcon,
  SettingsMenuIcon,
  TripHistoryMenuIcon,
} from './menuIcons'

function MenuRow({ icon, label, labelClass, onClick, trailing }) {
  const FF = { fontFeatureSettings: "'cv03', 'cv04', 'lnum', 'pnum'" }
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[54px] w-full shrink-0 px-6 flex items-center gap-6 hover:bg-[rgba(0,0,0,0.04)] transition-colors text-left"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-primary">{icon}</span>
      <span className={`flex-1 ${labelClass}`} style={FF}>
        {label}
      </span>
      {trailing}
    </button>
  )
}

export default function SideMenu({
  isOpen,
  onClose,
  userName = 'Bruno Arantes',
  onNavigate,
  onLogout,
}) {
  const LABEL_CLASS =
    'text-[20px] font-semibold leading-[25px] tracking-[-0.34px] text-[var(--color-content-primary)]'
  const MUTED_LABEL_CLASS =
    'text-[16px] font-[450] leading-5 tracking-[-0.176px] text-[var(--color-content-secondary)]'
  const FF = { fontFeatureSettings: "'cv03', 'cv04', 'lnum', 'pnum'" }

  function handleNav(screen) {
    onNavigate?.(screen)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-special-scrim)] z-[100]"
          />

          <motion.div
            initial={{ x: -296 }}
            animate={{ x: 0 }}
            exit={{ x: -296 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-0 left-0 bottom-0 w-[296px] z-[101]"
          >
            <div className="absolute bg-[var(--color-layer-floor-1)] bottom-0 left-0 overflow-clip shadow-[0px_6px_24px_0px_rgba(0,0,0,0.24)] top-0 w-[296px]" />
            <div className="absolute bg-[var(--color-layer-floor-1)] h-[160px] left-0 rounded-bl-[12px] rounded-br-[12px] top-0 w-[296px]" />
            <div className="absolute bg-[var(--color-layer-floor-1)] left-0 rounded-tl-[16px] rounded-tr-[16px] top-[84px] bottom-0 w-[296px]" />

            <div className="absolute h-[44px] left-[16px] top-[24px] w-[264px] flex items-center gap-3">
              <IconView.Root size="md" className="size-11 shrink-0 bg-neutral-secondary">
                <IconView.Icon icon={<ProfilePlaceholderIcon size="sm" className="text-tertiary" />} />
              </IconView.Root>
              <p
                className="text-[16px] font-semibold leading-5 tracking-[-0.176px] text-[var(--color-content-primary)]"
                style={FF}
              >
                {userName}
              </p>
            </div>

            <div className="absolute top-[84px] left-0 right-0 bottom-0 flex flex-col overflow-y-auto">
              <div className="pt-4 flex flex-col flex-1">
                <div className="flex flex-col">
                  <MenuRow
                    icon={<EarningsMenuIcon size="lg" />}
                    label="Earnings"
                    labelClass={LABEL_CLASS}
                    onClick={() => handleNav('earnings')}
                  />
                  <MenuRow
                    icon={<TripHistoryMenuIcon size="lg" />}
                    label="Trip history"
                    labelClass={LABEL_CLASS}
                    onClick={() => handleNav('rides')}
                  />
                  <MenuRow icon={<CampaignsMenuIcon size="lg" />} label="Campaigns" labelClass={LABEL_CLASS} />
                  <MenuRow icon={<ScheduledRidesMenuIcon size="lg" />} label="Scheduled rides" labelClass={LABEL_CLASS} />
                  <MenuRow icon={<SettingsMenuIcon size="lg" />} label="Settings" labelClass={LABEL_CLASS} />
                </div>

                <div className="flex-1" />

                <div className="flex flex-col pb-6">
                  <div className="bg-[var(--color-border-separator)] h-px mx-6 mb-2" />

                  <button
                    type="button"
                    className="h-[48px] w-full px-6 flex items-center gap-4 hover:bg-[rgba(0,0,0,0.04)] transition-colors"
                    onClick={onLogout}
                  >
                    <LogOutMenuIcon size="lg" className="text-secondary shrink-0" />
                    <p className={MUTED_LABEL_CLASS} style={FF}>
                      Log out
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
