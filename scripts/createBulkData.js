const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')
const slug = require('slug')
const faker = require('faker')
const { random, shuffle } = require('lodash')


const prisma = new PrismaClient()


const createBulkUsers = async () => {
  const data = Array.from({ length: 100 }).map(() => ({
    email: faker.internet.email(),
    password: '12345678',
  }))

  await prisma.user.createMany({ data })

  return prisma.user.findMany()
}

const createBulkBooks = async users => {
  const response = await fetch('https://www.googleapis.com/books/v1/volumes?q=a&maxResults=40')
  const json = await response.json()
  return Promise.all(json.items.map(async ({ volumeInfo: { title, description, authors = [], categories = [] } }) => {
    const book = await prisma.book.create({
      data: {
        title,
        slug: slug(title),
        description,
      },
    })

    await Promise.all(authors.map(async name => {
      const author = await prisma.author.findFirst({ where: { name } })

      if (author) {
        return prisma.author.update({
          where: { id: author.id },
          data: {
            books: { connect: { id: book.id } },
          },
        })
      } else {
        const createdAuthor = await prisma.author.create({
          data: {
            name,
            slug: slug(name),
          },
        })

        return prisma.author.update({
          where: { id: createdAuthor.id },
          data: {
            books: { connect: { id: book.id } },
          },
        })
      }
    }))
    await Promise.all(categories.map(async name => {
      const genre = await prisma.genre.findFirst({ where: { name } })

      if (genre) {
        return prisma.genre.update({
          where: { id: genre.id },
          data: {
            books: { connect: { id: book.id } },
          },
        })
      } else {
        const createdGenre = await prisma.genre.create({
          data: {
            name,
            slug: slug(name),
          },
        })

        return prisma.genre.update({
          where: { id: createdGenre.id },
          data: {
            books: { connect: { id: book.id } },
          },
        })
      }
    }))
    await Promise.all(shuffle(users).slice(random(0, 10)).map(user => {
      return prisma.review.create({
        data: {
          rating: random(1, 5),
          text: faker.lorem.sentence(),
          user: { connect: { id: user.id } },
          book: { connect: { id: book.id } }
        },
      })
    }))
  }))
}

const main = async () => {
  const users = await createBulkUsers()
  await createBulkBooks(users)
  process.exit()
}

main()