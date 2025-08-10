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
    const todos = await prisma.todo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ data: todos })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await request.json()
    
    // Clear existing user tasks and replace with new data
    await prisma.todo.deleteMany({
      where: { userId: session.user.id }
    })
    
    if (data && data.length > 0) {
      // Convert localStorage format to database format
      const todos = data.map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: new Date(todo.createdAt),
        userId: session.user.id
      }))
      
      await prisma.todo.createMany({
        data: todos
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
  }
}