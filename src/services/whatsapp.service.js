import api from './api'

class WhatsAppService {
  constructor() {
    // Use import.meta.env instead of process.env for Vite
    this.whatsappNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '+919876543210'
    this.apiUrl = 'https://graph.facebook.com/v17.0'
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || 'mock-id'
    this.accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || 'mock-token'
  }

  // Send bill/invoice via WhatsApp
  async sendBill(phoneNumber, saleData, pdfUrl = null) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      const message = this.formatBillMessage(saleData)
      
      console.log(`📱 Sending WhatsApp bill to ${formattedPhone} from ${this.whatsappNumber}`)
      
      // Check if we're in production by looking at the environment variable
      if (import.meta.env.MODE === 'production' && 
          import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID !== 'mock-id') {
        return await this.sendViaAPI(formattedPhone, 'text', message)
      } else {
        // Mock response for development
        console.log('📱 WhatsApp Bill Message:', message)
        return {
          success: true,
          mock: true,
          message: 'WhatsApp bill sent (demo mode)',
          to: formattedPhone,
          from: this.whatsappNumber
        }
      }
    } catch (error) {
      console.error('Failed to send WhatsApp bill:', error)
      throw error
    }
  }

  // Send campaign offer via WhatsApp
  async sendCampaignOffer(phoneNumber, campaign, customerName = '') {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      const message = this.formatCampaignMessage(campaign, customerName)
      
      console.log(`📱 Sending WhatsApp campaign offer to ${formattedPhone} from ${this.whatsappNumber}`)
      console.log('📱 Campaign:', campaign.name)
      
      if (import.meta.env.MODE === 'production' && 
          import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID !== 'mock-id') {
        return await this.sendViaAPI(formattedPhone, 'text', message)
      } else {
        return {
          success: true,
          mock: true,
          message: 'WhatsApp campaign sent (demo mode)',
          to: formattedPhone,
          from: this.whatsappNumber
        }
      }
    } catch (error) {
      console.error('Failed to send campaign offer:', error)
      throw error
    }
  }

  // Send bulk campaign offers
  async sendBulkCampaignOffers(campaignId, phoneNumbers, customerNames = []) {
    try {
      // We need to fetch campaign data first
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const campaign = await response.json()
      
      const results = {
        successful: [],
        failed: [],
        total: phoneNumbers.length,
        from: this.whatsappNumber
      }

      console.log(`📱 Starting bulk WhatsApp send to ${phoneNumbers.length} recipients`)
      console.log(`📱 From: ${this.whatsappNumber}`)

      // Send in batches to avoid rate limiting
      const batchSize = 10
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize)
        const batchNames = customerNames.slice(i, i + batchSize)
        
        const promises = batch.map((phone, index) => 
          this.sendCampaignOffer(phone, campaign.data, batchNames[index] || '')
            .then(() => {
              results.successful.push(phone)
              return { phone, success: true }
            })
            .catch(error => {
              results.failed.push({ phone, error: error.message })
              return { phone, success: false, error: error.message }
            })
        )

        await Promise.allSettled(promises)

        // Wait between batches to avoid rate limits
        if (i + batchSize < phoneNumbers.length) {
          console.log(`📱 Waiting before next batch...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log(`📱 Bulk send complete: ${results.successful.length} successful, ${results.failed.length} failed`)
      return results
    } catch (error) {
      console.error('Failed to send bulk campaign offers:', error)
      throw error
    }
  }

  // Send via actual WhatsApp Business API
  async sendViaAPI(to, type, content) {
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: type,
          [type]: type === 'text' ? { body: content } : { 
            link: content.url,
            filename: content.filename,
            caption: content.caption
          }
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('WhatsApp API error:', error)
      throw error
    }
  }

  // Format bill message
  formatBillMessage(saleData) {
    const date = new Date(saleData.saleDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    let message = `🧾 *FRUGANO - Invoice*\n\n`
    message += `━━━━━━━━━━━━━━━━━━━\n\n`
    message += `*Invoice No:* ${saleData.invoiceNo}\n`
    message += `*Date:* ${date}\n`
    message += `*Customer:* ${saleData.customerName || 'Walk-in Customer'}\n`
    message += `*Cashier:* ${saleData.cashier?.name || 'Unknown'}\n\n`
    message += `*Items:*\n`
    message += `━━━━━━━━━━━━━━━━━━━\n`
    
    saleData.items.forEach(item => {
      const name = item.product?.name || 'Unknown'
      const qty = item.quantity
      const price = item.sellingPrice
      const total = item.total
      message += `• ${name}\n  ${qty} x ₹${price} = ₹${total}\n`
    })
    
    message += `━━━━━━━━━━━━━━━━━━━\n`
    message += `*Subtotal:* ₹${saleData.subtotal}\n`
    if (saleData.discount > 0) {
      message += `*Discount:* -₹${saleData.discount}\n`
    }
    message += `*Tax:* ₹${saleData.taxAmount}\n`
    message += `*Total:* ₹${saleData.totalAmount}\n`
    message += `*Payment:* ${saleData.paymentMethod}\n`
    message += `━━━━━━━━━━━━━━━━━━━\n\n`
    
    message += `Thank you for shopping with Frugano!\n`
    message += `Visit us again! 🍏\n\n`
    message += `*${this.whatsappNumber}*`
    
    return message
  }

  // Format campaign message
  formatCampaignMessage(campaign, customerName = '') {
    const greeting = customerName ? `Dear ${customerName},` : 'Dear Customer,'
    
    const startDate = new Date(campaign.startDate).toLocaleDateString('en-IN')
    const endDate = new Date(campaign.endDate).toLocaleDateString('en-IN')
    
    let message = `🎉 *FRUGANO - Exclusive Offer* 🎉\n\n`
    message += `━━━━━━━━━━━━━━━━━━━\n\n`
    message += `${greeting}\n\n`
    message += `✨ *${campaign.name}*\n`
    message += `${campaign.description || 'Special offer just for you!'}\n\n`
    
    // Format discount based on type
    if (campaign.discountType === 'PERCENTAGE') {
      message += `💰 *${campaign.discountValue}% OFF*\n`
      if (campaign.maxDiscount) {
        message += `   Max discount: ₹${campaign.maxDiscount}\n`
      }
    } else if (campaign.discountType === 'FIXED_AMOUNT') {
      message += `💰 *₹${campaign.discountValue} OFF*\n`
    } else if (campaign.discountType === 'BUY_X_GET_Y') {
      message += `💰 *Buy ${campaign.buyQuantity || 1} Get ${campaign.getQuantity || 1} Free*\n`
    } else if (campaign.discountType === 'FREE_SHIPPING') {
      message += `🚚 *Free Delivery*\n`
    }
    
    if (campaign.minOrderValue > 0) {
      message += `\n*Minimum Order:* ₹${campaign.minOrderValue}\n`
    }
    
    message += `\n*Valid from:* ${startDate} to ${endDate}\n`
    message += `*Use Code:* ${campaign.code || 'FRUGANO'}\n\n`
    message += `━━━━━━━━━━━━━━━━━━━\n`
    message += `Hurry! Offer valid for limited time only.\n`
    message += `Shop now at Frugano! 🛒\n\n`
    message += `*${this.whatsappNumber}*`
    
    return message
  }

  // Validate phone number
  validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '')
    // Indian mobile numbers are 10 digits
    return cleaned.length === 10
  }

  // Format phone number for WhatsApp (add country code)
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '')
    // For Indian numbers, add 91 country code
    if (cleaned.length === 10) {
      return `91${cleaned}`
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned
    } else {
      return cleaned
    }
  }

  // Get WhatsApp business number
  getBusinessNumber() {
    return this.whatsappNumber
  }
}

export default new WhatsAppService()