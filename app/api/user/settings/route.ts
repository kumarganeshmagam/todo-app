import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        openaiKey: true,
        claudeKey: true,
        geminiKey: true,
        preferredAI: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      openaiKey: user.openaiKey,
      claudeKey: user.claudeKey,
      geminiKey: user.geminiKey,
      preferredAI: user.preferredAI || 'ollama'
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { openaiKey, claudeKey, geminiKey, preferredAI } = await request.json()

    // Update user settings
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        openaiKey: openaiKey || null,
        claudeKey: claudeKey || null,
        geminiKey: geminiKey || null,
        preferredAI: preferredAI || 'ollama'
      },
      select: {
        openaiKey: true,
        claudeKey: true,
        geminiKey: true,
        preferredAI: true,
      }
    })

    return NextResponse.json({
      openaiKey: user.openaiKey,
      claudeKey: user.claudeKey,
      geminiKey: user.geminiKey,
      preferredAI: user.preferredAI
    })

  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}