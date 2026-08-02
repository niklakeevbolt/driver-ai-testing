const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function padTime(t) {
  return t
}

/** e.g. "2 Aug" */
export function formatDay(date = new Date()) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

/** Same-calendar-day campaign window, e.g. "2 Aug, 06:00 – 2 Aug, 22:00" */
export function sameDayWindow(start, end, date = new Date()) {
  const day = formatDay(date)
  return `${day}, ${padTime(start)} – ${day}, ${padTime(end)}`
}

/** Yesterday stamp for last-ride rows */
export function yesterdayStamp(time = '12:24', date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return `${formatDay(d)}, ${time}`
}

export function rewardsMonthTitle(date = new Date()) {
  return `Your ${MONTHS[date.getMonth()]} progress`
}

/** Hub inbox / help dates relative to today */
export function daysAgoStamp(daysAgo, date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - daysAgo)
  return formatDay(d)
}

export function todayTimeStamp(time, date = new Date()) {
  return `${formatDay(date)}, ${time}`
}
