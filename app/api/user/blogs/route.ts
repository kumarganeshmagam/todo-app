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
    const blogs = await prisma.blog.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json({ data: blogs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await request.json()
    
    // Clear existing user blogs and replace with new data
    await prisma.blog.deleteMany({
      where: { userId: session.user.id }
    })
    
    if (data && data.length > 0) {
      // Convert localStorage format to database format
      const blogs = data.map((blog: any) => ({
        id: blog.id,
        title: blog.title,
        contentHtml: blog.contentHtml,
        createdAt: new Date(),
        updatedAt: new Date(blog.updatedAt),
        userId: session.user.id
      }))
      
      await prisma.blog.createMany({
        data: blogs
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save blogs' }, { status: 500 })
  }
}