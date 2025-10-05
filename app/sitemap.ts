import { MetadataRoute } from 'next'
import { loadServicesConfig } from '@/lib/services'

export default function sitemap(): MetadataRoute.Sitemap {
  const servicesConfig = loadServicesConfig()
  const services = Object.keys(servicesConfig).map(slug => ({
    url: `https://internetstreets.uk/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://internetstreets.uk',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://internetstreets.uk/services',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://internetstreets.uk/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://internetstreets.uk/tos',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...services,
  ]
}
