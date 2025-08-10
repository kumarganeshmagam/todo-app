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
      const todos = data.map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed || false,
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
        userId: session.user.id
      }))
      
      await prisma.todo.createMany({
        data: todos
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Failed to migrate tasks' }, { status: 500 })
  }
}