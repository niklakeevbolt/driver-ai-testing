const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** e.g. "Aug 2" */
export function formatDay(date = new Date()) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Next `count` calendar days starting today, for the Opportunities strip. */
export function upcomingDays(count = 7, date = new Date()) {
  return Array.from({ length: count }, (_, offset) => {
    const d = addDays(date, offset)
    return {
      offset,
      date: d,
      label: formatDay(d),
    }
  })
}

/** Same-calendar-day campaign window, e.g. "Aug 2, 06:00 – Aug 2, 22:00" */
export function sameDayWindow(start, end, date = new Date()) {
  const day = formatDay(date)
  return `${day}, ${start} – ${day}, ${end}`
}

/**
 * Bind campaigns to a calendar day.
 * Today (offset 0) may keep active quests; future days are always inactive
 * and labelled with that day's date window.
 */
export function resolveCampaignsForDay(campaigns, dayOffset, date = new Date()) {
  const dayDate = addDays(date, dayOffset)
  return campaigns.map((campaign) => {
    const start = campaign.windowStart ?? '06:00'
    const end = campaign.windowEnd ?? '22:00'
    if (dayOffset > 0) {
      return {
        ...campaign,
        active: false,
        label: sameDayWindow(start, end, dayDate),
        completed: undefined,
        progress: undefined,
      }
    }
    if (campaign.active) return campaign
    return {
      ...campaign,
      label: sameDayWindow(start, end, dayDate),
    }
  })
}

/** Yesterday stamp for last-ride rows */
export function yesterdayStamp(time = '12:24', date = new Date()) {
  return `${formatDay(addDays(date, -1))}, ${time}`
}

export function rewardsMonthTitle(date = new Date()) {
  return `Your ${MONTHS[date.getMonth()]} progress`
}

/** Hub inbox / help dates relative to today */
export function daysAgoStamp(daysAgo, date = new Date()) {
  return formatDay(addDays(date, -daysAgo))
}

export function todayTimeStamp(time, date = new Date()) {
  return `${formatDay(date)}, ${time}`
}
