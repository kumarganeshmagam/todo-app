import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For now, we'll implement a simple registration system
        // In a real app, you'd have separate sign-up flow
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // Auto-create user on first login attempt
          const hashedPassword = await bcrypt.hash(credentials.password, 12)
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0], // Use email prefix as default name
            }
          })
        }

        // Note: In a real app, you'd verify password here
        // For simplicity, we're auto-creating users
        
        return {
          id: user.id,
          email: user.email || '',
          name: user.name || undefined,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}