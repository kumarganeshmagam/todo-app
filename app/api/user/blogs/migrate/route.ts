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
      const blogs = data.map((blog: any) => ({
        id: blog.id,
        title: blog.title || 'Untitled',
        contentHtml: blog.contentHtml || '',
        createdAt: new Date(),
        updatedAt: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
        userId: session.user.id
      }))
      
      await prisma.blog.createMany({
        data: blogs
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Failed to migrate blogs' }, { status: 500 })
  }
}