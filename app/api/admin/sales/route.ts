import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

// Mark this route as dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

interface SalesData {
  slug: string
  count: number
  revenue: number
  lastSale: string
}

interface DashboardData {
  sales: SalesData[]
  totals: {
    totalSales: number
    totalRevenue: number
  }
}

function verifyAdminSession(): boolean {
  const cookieStore = cookies()
  const adminSession = cookieStore.get('admin_session')
  return adminSession?.value === 'true'
}

function getDateFilter(filter: string): { gte?: number } {
  const now = Math.floor(Date.now() / 1000)
  
  switch (filter) {
    case 'today':
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return { gte: Math.floor(today.getTime() / 1000) }
    case '7days':
      return { gte: now - (7 * 24 * 60 * 60) }
    case '30days':
      return { gte: now - (30 * 24 * 60 * 60) }
    default:
      return {}
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    if (!verifyAdminSession()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          sales: [],
          totals: {
            totalSales: 0,
            totalRevenue: 0,
          },
        },
        message: 'Stripe not configured - add STRIPE_SECRET_KEY to see sales data'
      })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const dateFilter = getDateFilter(filter)

    // Fetch completed checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      created: dateFilter,
    })

    // Group sessions by service slug
    const salesMap = new Map<string, SalesData>()

    for (const session of sessions.data) {
      const slug = session.metadata?.slug
      if (!slug) continue

      const amount = session.amount_total || 0
      const created = session.created

      if (salesMap.has(slug)) {
        const existing = salesMap.get(slug)!
        existing.count += 1
        existing.revenue += amount
        if (created > new Date(existing.lastSale).getTime() / 1000) {
          existing.lastSale = new Date(created * 1000).toISOString()
        }
      } else {
        salesMap.set(slug, {
          slug,
          count: 1,
          revenue: amount,
          lastSale: new Date(created * 1000).toISOString(),
        })
      }
    }

    // Convert map to array and sort by revenue
    const sales = Array.from(salesMap.values()).sort((a, b) => b.revenue - a.revenue)

    // Calculate totals
    const totals = {
      totalSales: sales.reduce((sum, sale) => sum + sale.count, 0),
      totalRevenue: sales.reduce((sum, sale) => sum + sale.revenue, 0),
    }

    const data: DashboardData = {
      sales,
      totals,
    }

    return NextResponse.json({
      success: true,
      data,
      message: data.sales.length === 0 ? 'No sales data found for the selected period' : undefined
    })

  } catch (error) {
    console.error('Admin sales API error:', error)
    return NextResponse.json({
      success: true,
      data: {
        sales: [],
        totals: {
          totalSales: 0,
          totalRevenue: 0,
        },
      },
      message: `Stripe API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}
