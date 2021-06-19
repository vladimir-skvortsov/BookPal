import NextAuth from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import Providers  from 'next-auth/providers'
import { compare } from 'bcrypt'


const prisma = new PrismaClient()
const handler = NextAuth({
  providers: [
    Providers .Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: {  label: 'Password', type: 'password' },
      },
      authorize: async ({ email, password }: { email: string; password: string }) => {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) return null

        const doesPasswordMatch = await compare(password, user.password)

        if (doesPasswordMatch) return user
        else return null
      },
    })
  ],
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.JWT_TOKEN,
  adapter: PrismaAdapter(prisma),
})


export default handler