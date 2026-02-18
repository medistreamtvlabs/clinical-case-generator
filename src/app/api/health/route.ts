import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { HealthResponse } from '@/types/api'

export async function GET() {
  try {
    // Check database connection
    let dbStatus: 'connected' | 'disconnected' = 'disconnected'
    try {
      await db.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (error) {
      console.error('Database connection failed:', error)
    }

    // Check Claude API (just verify the key exists for now)
    const claudeStatus: 'available' | 'unavailable' =
      process.env.ANTHROPIC_API_KEY ? 'available' : 'unavailable'

    // Check file storage
    const fileStorageStatus: 'ok' | 'error' = 'ok' // We'll enhance this later

    const response: HealthResponse = {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        claudeApi: claudeStatus,
        fileStorage: fileStorageStatus,
      },
    }

    return NextResponse.json(response, {
      status: response.status === 'ok' ? 200 : 503,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          claudeApi: 'unavailable',
          fileStorage: 'error',
        },
      },
      { status: 500 }
    )
  }
}
