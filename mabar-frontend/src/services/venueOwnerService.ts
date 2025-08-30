import Parse from './back4app'

export interface VenueOwnerData {
  personalInfo: {
    name: string
    email: string
  }
  venueDetails: {
    name: string
    address: string
    facilities: string[]
  }
  legalDocs: {
    nik: string
    siup: string
    phone: string
  }
}

export class VenueOwnerService {
  static async saveVenueOwnerApplication(
    data: VenueOwnerData,
    files: File[] = []
  ) {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        throw new Error('No user logged in')
      }

      // Check if venue owner profile already exists
      const VenueOwner = Parse.Object.extend('VenueOwner')
      const query = new Parse.Query(VenueOwner)
      query.equalTo('user', currentUser)

      const existingVenueOwner = await query.first()

      const venueOwner = existingVenueOwner || new VenueOwner()

      if (!existingVenueOwner) {
        venueOwner.set('user', currentUser)
      }

      // Set all the data
      venueOwner.set('personalInfo', data.personalInfo)
      venueOwner.set('venueDetails', data.venueDetails)
      venueOwner.set('legalDocs', data.legalDocs)
      venueOwner.set('status', 'pending_verification')
      venueOwner.set('submittedAt', new Date())

      // Upload files if any
      if (files.length > 0) {
        const fileUrls = []
        for (const file of files) {
          const parseFile = new Parse.File(file.name, file)
          await parseFile.save()
          fileUrls.push({
            name: file.name,
            url: parseFile.url(),
            type: file.type,
          })
        }
        venueOwner.set('documents', fileUrls)
      }

      // Save venue owner profile
      await venueOwner.save()

      // Update user onboarding status
      currentUser.set('onboardingStatus', 'completed')
      await currentUser.save()

      return { success: true, venueOwner }
    } catch (error) {
      console.error('Error saving venue owner application:', error)
      throw error
    }
  }

  static async getVenueOwnerProfile() {
    try {
      const currentUser = Parse.User.current()
      if (!currentUser) {
        return null
      }

      const VenueOwner = Parse.Object.extend('VenueOwner')
      const query = new Parse.Query(VenueOwner)
      query.equalTo('user', currentUser)

      const venueOwner = await query.first()
      return venueOwner
    } catch (error) {
      console.error('Error fetching venue owner profile:', error)
      return null
    }
  }

  static async checkApplicationStatus() {
    try {
      const venueOwner = await this.getVenueOwnerProfile()
      if (!venueOwner) {
        return { exists: false, status: null }
      }

      return {
        exists: true,
        status: venueOwner.get('status'),
        submittedAt: venueOwner.get('submittedAt'),
        verifiedAt: venueOwner.get('verifiedAt'),
      }
    } catch (error) {
      console.error('Error checking application status:', error)
      return { exists: false, status: null }
    }
  }
}
