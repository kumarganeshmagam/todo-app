import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await request.json()
    
    if (data && data.length > 0) {
      // Convert localStorage format to database format
      const notes = data.map((note: any) => ({
        id: note.id,
        title: note.title || 'Untitled',
        contentHtml: note.contentHtml || '',
        createdAt: new Date(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
        userId: session.user.id
      }))
      
      await prisma.note.createMany({
        data: notes
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Failed to migrate notes' }, { status: 500 })
  }
}