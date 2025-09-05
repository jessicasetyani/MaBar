/**
 * MaBar Design System - Color Palette
 * Mandatory colors as defined in design-rules.md
 */

export const MaBarColors = {
  // Primary Colors
  primary: '#FDE047', // MaBar Yellow - Primary buttons, CTAs
  background: '#FEFCE8', // Light Cream - Main background
  surface: '#FFFFFF', // White - Cards, modals, inputs

  // Text Colors
  text: '#334155', // Charcoal - Primary text
  textSubtle: '#64748B', // Slate Gray - Secondary text, placeholders

  // Accent Colors
  accent: '#84CC16', // Padel Green - Secondary actions, success

  // Status Colors (derived from palette)
  success: '#84CC16', // Padel Green
  warning: '#FDE047', // MaBar Yellow
  error: '#EF4444', // Standard error red

  // Calendar-specific colors
  calendar: {
    confirmed: '#84CC16', // Padel Green for confirmed bookings
    pending: '#FDE047', // MaBar Yellow for pending bookings
    blocked: '#EF4444', // Red for blocked slots
    selected: '#3B82F6', // Blue for selected slots
  },

  // Hover states (slightly darker variants)
  hover: {
    primary: '#FACC15', // Darker yellow
    accent: '#65A30D', // Darker green
    surface: '#F8FAFC', // Light gray
  },
} as const

export type MaBarColorKey = keyof typeof MaBarColors
