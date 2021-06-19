import { ApolloServer, gql  } from 'apollo-server-micro'
import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcrypt'
import { getSession } from 'next-auth/client'
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date'


const typeDefs = gql`
  scalar Date
  scalar DateTime

  type User {
    id: String!
    email: String!
    reviews: [Review!]!
    books: [Book!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Genre {
    id: String!
    slug: String!
    name: String!
    books: [Book!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Author {
    id: String!
    slug: String!
    name: String!
    books: [Book!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Book {
    id: String!
    slug: String!
    cover: String
    title: String!
    description: String
    users: [User!]!
    genres: [Genre!]!
    authors: [Author!]!
    reviews: [Review!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Review {
    id: String!
    user: User!
    book: Book!
    text: String!
    rating: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    book(idOrSlug: String!): Book!
    books(query: String): [Book!]!

    genre(idOrSlug: String!): Genre!
    genres(query: String): [Genre!]!

    author(idOrSlug: String!): Author!
    authors(query: String): [Author!]!

    user: User!
  }

  input AddReviewData {
    rating: Float!
    text: String!
  }

  input UpdateReviewData {
    rating: Float
    text: String
  }

  type Mutation {
    signUp(email: String!, password: String!): User!
    signIn(email: String!, password: String!): User!

    addBookToUser(bookId: String!): Book!
    removeBookFromUser(bookId: String!): Book!

    addReview(bookId: String!, data: AddReviewData!): Review!
    updateReview(bookId: String!, data: UpdateReviewData!): Review!
    deleteReview(bookId: String!): Review!
  }
`
const prisma = new PrismaClient()
const resolvers = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Query: {
    book: (parent, { idOrSlug }) => {
      return prisma.book.findFirst({
        where: {
          OR: [
            { id: { equals: idOrSlug } },
            { slug: { equals: idOrSlug } },
          ],
        },
        include: {
          reviews: {
            include: { user: true },
          },
        },
      })
    },
    books: (paren, { query = '' }) => {
      return prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { genres: { some: { name: { contains: query, mode: 'insensitive' } } } },
            { authors: { some: { name: { contains: query, mode: 'insensitive' } } } },
          ],
        },
      })
    },

    genre: (parent, { idOrSlug }) => {
      return prisma.genre.findFirst({
        where: {
          OR: [
            { id: { equals: idOrSlug } },
            { slug: { equals: idOrSlug } },
          ],
        },
      })
    },
    genres: (paren, { query = '' }) => {
      return prisma.genre.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
      })
    },

    author: (parent, { idOrSlug }) => {
      return prisma.author.findFirst({
        where: {
          OR: [
            { id: { equals: idOrSlug } },
            { slug: { equals: idOrSlug } },
          ],
        },
      })
    },
    authors: (paren, { query = '' }) => {
      return prisma.author.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
      })
    },
    user: async (parent, args, { user }) => {
      return prisma.user.findUnique({
        where: { id: user.id },
        include: { books: true, reviews: true },
      })
    },
  },
  Mutation: {
    signUp: async (parent, { email, password }) => {
      const hashedPassword = await hash(password, 10)
      const user = prisma.user.create({ data: { email, password: hashedPassword } })

      return user
    },
    signIn: async (parent, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      const doesPasswordMatch = await compare(password, user.password)

      if (doesPasswordMatch) return user
      else throw new Error('Password is incorrect')
    },
    addBookToUser: async (parent, { bookId }, { user }) => {
      if (!user) {
        throw new Error('You are not logged in')
      }

      const book = await prisma.book.findUnique({ where: { id: bookId } })

      if (!book) {
        throw new Error('The book does not exist')
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          books: { connect: { id: bookId } },
        },
      })

      return book
    },
    removeBookFromUser: async (parent, { bookId }, { user }) => {
      if (!user) {
        throw new Error('You are not logged in')
      }

      const book = await prisma.book.findUnique({ where: { id: bookId } })

      if (!book) {
        throw new Error('The book does not exist')
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          books: { disconnect: { id: bookId } },
        },
      })

      return book
    },
    addReview: async (parent, { bookId, data }, { user }) => {
      if (!user) {
        throw new Error('You are not logged in')
      }

      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating has to be between 1 and 5')
      }

      const existingReview = await prisma.review.findFirst({ where: { userId: user.id, bookId: bookId } })

      if (existingReview) {
        throw new Error('The user already created the review')
      }

      const review = await prisma.review.create({
        data: {
          ...data,
          book: { connect: { id: bookId } },
          user: { connect: { id: user.id } },
        },
      })

      return review
    },
    updateReview: async (parent, { bookId, data }, { user }) => {
      if (!user) {
        throw new Error('You are not logged in')
      }

      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating has to be between 1 and 5')
      }

      const existingReview = await prisma.review.findFirst({ where: { userId: user.id, bookId: bookId } })

      if (!existingReview) {
        throw new Error('The review does not exist')
      }

      await prisma.review.updateMany({ where: { userId: user.id, bookId: bookId }, data })

      const updatedReview = await prisma.review.findFirst({ where: { userId: user.id, bookId: bookId } })

      return updatedReview
    },
    deleteReview: async (parent, { bookId }, { user }) => {
      if (!user) {
        throw new Error('You are not logged in')
      }

      const review = await prisma.review.findFirst({ where: { userId: user.id, bookId: bookId } })
      await prisma.review.deleteMany({ where: { userId: user.id, bookId: bookId } })

      return review
    },
  },
}
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const session = await getSession({ req })
    const user = session && await prisma.user.findUnique({ where: { email: session.user.email } })

    return { user }
  },
})
const handler = server.createHandler({ path: '/api/graphql' })


export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler