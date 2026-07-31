export default function SlidingTabPanels({
  activeTab,
  tabs,
  className = '',
  panelClassName = '',
}) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const safeIndex = activeIndex === -1 ? 0 : activeIndex
  const panelShare = 100 / tabs.length

  return (
    <div className={`w-full overflow-hidden ${className}`.trim()}>
      <div
        className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `${tabs.length * 100}%`,
          transform: `translateX(-${safeIndex * panelShare}%)`,
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`shrink-0 ${panelClassName}`.trim()}
            style={{ width: `${panelShare}%` }}
            aria-hidden={tab.id !== activeTab}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
