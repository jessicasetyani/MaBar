/**
 * Validation utilities for MaBar booking system
 */

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  /**
   * Validate Indonesian phone number format
   * Supports formats: +62xxx, 08xxx, 62xxx
   */
  static isValidPhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false
    }
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
    return phoneRegex.test(cleanPhone)
  }

  /**
   * Validate booking time range
   */
  static isValidTimeRange(startTime: Date, endTime: Date): boolean {
    return (
      startTime < endTime &&
      endTime.getTime() - startTime.getTime() >= 30 * 60 * 1000
    ) // Minimum 30 minutes
  }

  /**
   * Validate player names (1-4 players, non-empty names)
   */
  static validatePlayers(players: string[]): {
    isValid: boolean
    error?: string
  } {
    // Ensure players is an array and filter out invalid entries
    if (!Array.isArray(players)) {
      return { isValid: false, error: 'Players must be an array' }
    }

    const validPlayers = players.filter((p) => p && typeof p === 'string' && p.trim())

    if (validPlayers.length === 0) {
      return { isValid: false, error: 'At least one player name is required' }
    }

    if (validPlayers.length > 4) {
      return { isValid: false, error: 'Maximum 4 players allowed' }
    }

    // Check for duplicate names
    const uniqueNames = new Set(validPlayers.map((p) => p.trim().toLowerCase()))
    if (uniqueNames.size !== validPlayers.length) {
      return { isValid: false, error: 'Player names must be unique' }
    }

    return { isValid: true }
  }

  /**
   * Validate price (must be positive number)
   */
  static isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && !isNaN(price)
  }

  /**
   * Validate court name
   */
  static isValidCourt(court: string): boolean {
    return typeof court === 'string' && court.trim().length > 0
  }

  /**
   * Validate venue ID
   */
  static isValidVenueId(venueId: string): boolean {
    return typeof venueId === 'string' && venueId.trim().length > 0
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  /**
   * Validate booking ID format
   */
  static isValidBookingId(id: string): boolean {
    return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9]+$/.test(id)
  }
}
