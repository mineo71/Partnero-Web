// src/services/businessService.ts

export interface BusinessLocation {
    displayName: string
    street: string
    city: string
    state: string
    postcode: string
    country: string
    latitude: number
    longitude: number
  }
  
  export interface SocialMedia {
    instagram?: string
    youTube?: string
    linkedIn?: string
    website?: string
  }
  
  export interface BusinessData {
    id: {
      timestamp: number
      creationTime: string
    }
    userId: {
      timestamp: number
      creationTime: string
    }
    businessName: string
    category: string
    location: BusinessLocation
    description: string
    companySize: number
    foundedYear: number
    businessImageUrls: string[]
    socialMedia: SocialMedia
  }
  
  export interface ApiError {
    message: string
    status: number
  }
  
  class BusinessService {
    private baseUrl: string
  
    constructor() {
      // Use environment variable or fallback to localhost for development
      this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5219'
    }
  
    async getBusinessById(id: string): Promise<BusinessData> {
      try {
        const url = `${this.baseUrl}/api/ApplicationUser/business/${id}`
        console.log('Fetching business data from:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add ngrok bypass header if using ngrok
            'ngrok-skip-browser-warning': 'true',
          },
        })
  
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new ApiError({
              message: 'Business not found',
              status: 404,
            })
          }
          
          // Try to get error details from response
          let errorMessage = 'Failed to fetch business data'
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = errorText
            }
          } catch (e) {
            console.log('Could not parse error response')
          }
          
          throw new ApiError({
            message: errorMessage,
            status: response.status,
          })
        }
  
        const data = await response.json()
        console.log('Fetched business data:', data)
        return data
      } catch (error) {
        console.error('Error in getBusinessById:', error)
        
        if (error instanceof ApiError) {
          throw error
        }
        
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new ApiError({
            message: 'Network error - could not connect to server',
            status: 0,
          })
        }
        
        throw new ApiError({
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 0,
        })
      }
    }
  
    // Helper methods for formatting business data
    formatLocation(location: BusinessLocation): string {
      const parts = [location.city, location.state, location.country].filter(part => part && part !== '-')
      return parts.join(', ') || location.displayName || 'Location not specified'
    }
  
    getFullAddress(location: BusinessLocation): string {
      const parts = [
        location.street,
        location.city,
        location.state,
        location.postcode,
        location.country
      ].filter(part => part && part !== '-')
      return parts.join(', ') || location.displayName || 'Address not available'
    }
  
    getCompanySizeLabel(size: number): string {
      if (size <= 10) return '1-10 employees'
      if (size <= 50) return '11-50 employees'
      if (size <= 200) return '51-200 employees'
      if (size <= 500) return '201-500 employees'
      return '500+ employees'
    }
  
    getBusinessImageUrl(business: BusinessData, index: number = 0): string {
      return business.businessImageUrls?.[index] || '/api/placeholder/800/600'
    }
  
    // Helper to get available social platforms with URLs
    getAvailableSocialPlatforms(socialMedia: SocialMedia): Array<{ platform: string; url: string }> {
      return Object.entries(socialMedia)
        .filter(([key, value]) => value && value.trim() !== '')
        .map(([key, value]) => ({ platform: key, url: value }))
    }
  
    // Helper to get properly formatted social URLs
    formatSocialUrl(url: string): string {
      if (!url) return ''
      return url.startsWith('http') ? url : `https://${url}`
    }
  
    // Convert business data to display format (if needed for compatibility)
    convertToDisplayFormat(business: BusinessData) {
      return {
        id: business.id.timestamp.toString(),
        name: business.businessName,
        description: business.description,
        category: business.category,
        location: this.formatLocation(business.location),
        fullAddress: this.getFullAddress(business.location),
        companySize: this.getCompanySizeLabel(business.companySize),
        foundedYear: business.foundedYear,
        images: business.businessImageUrls || [],
        socialMedia: business.socialMedia,
        // Add any additional computed fields
        availablePlatforms: this.getAvailableSocialPlatforms(business.socialMedia)
      }
    }
  }
  
  // Custom error class
  export class ApiError extends Error {
    status: number
    details: any
  
    constructor({ message, status }: { message: string; status: number }) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  }
  
  // Export singleton instance
  export const businessService = new BusinessService()
  
  export default BusinessService