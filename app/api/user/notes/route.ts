import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json({ data: notes })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await request.json()
    
    // Clear existing user notes and replace with new data
    await prisma.note.deleteMany({
      where: { userId: session.user.id }
    })
    
    if (data && data.length > 0) {
      // Convert localStorage format to database format
      const notes = data.map((note: any) => ({
        id: note.id,
        title: note.title,
        contentHtml: note.contentHtml,
        createdAt: new Date(),
        updatedAt: new Date(note.updatedAt),
        userId: session.user.id
      }))
      
      await prisma.note.createMany({
        data: notes
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}