import { lighten, darken } from 'polished'


export const accentColor = '#cb997e'
export const lightenAccentColor = lighten(.05, accentColor)
export const darkenAccentColor = darken(.05, accentColor)

export const primaryColor = '#fff'
export const lightenPrimaryColor = lighten(.05, primaryColor)
export const darkenPrimaryColor = darken(.05, primaryColor)

export const fontColor = '#333'
export const lightenFontColor = lighten(.05, fontColor)
export const darkenFontColor = darken(.05, fontColor)

export const transition = '.2s ease'


export default {
  accentColor,
  lightenAccentColor,
  darkenAccentColor,

  primaryColor,
  lightenPrimaryColor,
  darkenPrimaryColor,

  fontColor,
  lightenFontColor,
  darkenFontColor,

  transition,
}