import icons from '../assets/operator-icons.json' with { type: 'json' }

// Keep the icon's 18px artwork independent of the Blockly field's layout box.
export function operatorIconDataUrl(value, { width = 18, height = 18, y = 0 } = {}) {
  const icon = icons[value]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><svg x="${(width - 18) / 2}" y="${y}" width="18" height="18" viewBox="${icon.viewBox}">${icon.content}</svg></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
