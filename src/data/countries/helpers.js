/** Build map hex / cluster polygons relative to a city center. */

export function makeHex(lat, lng, r = 0.006) {
  const aspect = 1 / Math.cos((lat * Math.PI) / 180)
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return [lat + r * Math.cos(a), lng + r * Math.sin(a) * aspect]
  })
}

export function offset(center, dLat, dLng) {
  return [center[0] + dLat, center[1] + dLng]
}

export function clusterPolygon(center, size = 0.018) {
  const [lat, lng] = center
  const aspect = 1 / Math.cos((lat * Math.PI) / 180)
  return [
    [lat + size, lng - size * 0.7 * aspect],
    [lat + size * 1.1, lng + size * 0.2 * aspect],
    [lat + size * 0.4, lng + size * 1.1 * aspect],
    [lat - size * 0.5, lng + size * 0.9 * aspect],
    [lat - size * 0.9, lng],
    [lat - size * 0.5, lng - size * 0.8 * aspect],
    [lat + size * 0.2, lng - size * 1.0 * aspect],
    [lat + size * 0.7, lng - size * 0.9 * aspect],
  ]
}

export function buildZones(center, districts, money) {
  const clusters = districts.clusters.map((d) => ({
    id: d.id,
    name: d.name,
    bonus: money.surge(d.bonus),
    waitTime: d.waitTime,
    level: d.level,
    subtitle: d.subtitle,
    peakLabel: d.peakLabel,
    peakStart: d.peakStart,
    peakEnd: d.peakEnd,
    color: d.color,
    fillColor: d.fillColor,
    center: offset(center, d.dLat, d.dLng),
    polygon: clusterPolygon(offset(center, d.dLat, d.dLng), d.size ?? 0.016),
  }))

  const individuals = districts.individuals.map((d) => {
    const c = offset(center, d.dLat, d.dLng)
    return {
      id: d.id,
      name: d.name,
      bonus: money.surge(d.bonus),
      waitTime: d.waitTime,
      level: d.level,
      subtitle: d.subtitle,
      peakLabel: d.peakLabel,
      peakStart: d.peakStart,
      peakEnd: d.peakEnd,
      color: d.color,
      fillColor: d.fillColor,
      center: c,
      polygon: makeHex(c[0], c[1], d.r ?? 0.0055),
    }
  })

  return {
    clusters,
    individuals,
    driverAreaIds: new Set(districts.driverAreaIds),
  }
}
