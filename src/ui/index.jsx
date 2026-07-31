import { createContext, useContext, useState } from 'react'

export function GhostButton({ children, className = '', ...props }) {
  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  )
}

export function IconButton({ icon, className = '', ...props }) {
  return (
    <button type="button" className={`inline-flex items-center justify-center bg-layer-floor-1 ${className}`} {...props}>
      {icon}
    </button>
  )
}

const IconViewRoot = ({ children, className = '', ...props }) => (
  <div className={`inline-flex items-center justify-center rounded-full ${className}`} {...props}>
    {children}
  </div>
)
const IconViewIcon = ({ icon }) => icon

export const IconView = { Root: IconViewRoot, Icon: IconViewIcon }

const TabsContext = createContext(null)

function TabsRoot({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className = '' }) {
  return (
    <div className={`relative flex border-b border-separator ${className}`} role="tablist">
      {children}
    </div>
  )
}

function TabsTab({ value, children, className = '' }) {
  const ctx = useContext(TabsContext)
  const selected = ctx?.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`bolt-font-body-m-compact-accent border-b-2 py-3 transition-colors ${
        selected ? 'border-action-primary text-primary' : 'border-transparent text-secondary'
      } ${className}`}
      onClick={() => ctx?.onValueChange?.(value)}
    >
      {children}
    </button>
  )
}

function TabsIndicator() {
  return null
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
}

const ALERT_STYLES = {
  warning: 'bg-warning-secondary text-warning-primary',
}

function AlertRoot({ children, className = '', severity = 'warning' }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${ALERT_STYLES[severity] ?? ALERT_STYLES.warning} ${className}`} role="alert">
      {children}
    </div>
  )
}

function AlertIcon() {
  return (
    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
      ⚠
    </span>
  )
}

function AlertContent({ children }) {
  return <div className="min-w-0 flex-1">{children}</div>
}

function AlertDescription({ children }) {
  return <p className="bolt-font-body-s">{children}</p>
}

export const Alert = {
  Root: AlertRoot,
  Icon: AlertIcon,
  Content: AlertContent,
  Description: AlertDescription,
}

const BADGE_STYLES = {
  'warning-secondary': 'bg-warning-secondary text-warning-primary',
  'action-secondary': 'bg-action-secondary text-action-primary',
}

function BadgeRoot({ children, className = '', variant = 'action-secondary', size: _size, type: _type }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 bolt-font-body-xs ${BADGE_STYLES[variant] ?? BADGE_STYLES['action-secondary']} ${className}`}>
      {children}
    </span>
  )
}

function BadgeIcon({ icon }) {
  return <span className="inline-flex size-4 items-center justify-center [&_svg]:size-3">{icon}</span>
}

function BadgeContent({ children }) {
  return <span>{children}</span>
}

function BadgeComponent(props) {
  return <BadgeRoot {...props} />
}
BadgeComponent.Icon = BadgeIcon
BadgeComponent.Content = BadgeContent

export { BadgeComponent as Badge }

function ListItemRoot({ children, className = '' }) {
  return <div className={`flex w-full items-center ${className}`}>{children}</div>
}

function ListItemContent({ children, className = '' }) {
  return <div className={`min-w-0 flex-1 ${className}`}>{children}</div>
}

function ListItemSlot({ children, className = '' }) {
  return <div className={`shrink-0 ${className}`}>{children}</div>
}

export const ListItemLayout = {
  Root: ListItemRoot,
  Content: ListItemContent,
  Slot: ListItemSlot,
}

function TypographyPrimary({ children, className = '' }) {
  return <span className={className}>{children}</span>
}

export const TypographyStack = Object.assign(
  ({ children }) => <div className="flex flex-col">{children}</div>,
  { Primary: TypographyPrimary },
)
