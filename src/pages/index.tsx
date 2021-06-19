import Head from 'next/head'
import { Row, Col } from 'antd'
import { getSession } from 'next-auth/client'
import { Prisma, PrismaClient, Book } from '@prisma/client'

import BooksSection from '@src/components/BooksSection'


const userWithBooks = Prisma.validator<Prisma.UserArgs>()({
  include: { books: true },
})
type UserWithBooks = Prisma.UserGetPayload<typeof userWithBooks>

const genresWithBooks = Prisma.validator<Prisma.GenreArgs>()({
  include: { books: true },
})
type GenreWithBooks = Prisma.GenreGetPayload<typeof genresWithBooks>

export interface Props {
  popularBooks: Book[]
  genres: GenreWithBooks[]
  user: UserWithBooks | null
}


const Home = ({ popularBooks, genres, user }: Props) => (
  <>
    <Head>
      <title>Home</title>
    </Head>

    <Row gutter={[0, 20]}>
        {user && !!user.books.length && (
          <Col span={24}>
            <BooksSection title='My library' url='/library' books={user.books} />
          </Col>
        )}

      <Col span={24}>
        <BooksSection title='Most popular' url='/popular' books={popularBooks} />
      </Col>


      {genres.map(({ id, name, slug, books }) => (
        <Col key={id} span={24}>
          <BooksSection title={name} url={`/genre/${slug}`} books={books} />
        </Col>
      ))}
    </Row>
  </>
)


const prisma = new PrismaClient()
export const getServerSideProps = async ({ req }) => {
  const session = await getSession({ req })
  const user = session && await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { books: { include: { authors: true }, take: 5 } },
  })
  const genres = await prisma.genre.findMany({
    include: {
      books: { include: { authors: true }, take: 5 },
    },
  })
  const popularBooks = await prisma.book.findMany({
    orderBy: {
      users: {
        _count: 'desc',
      },
    },
    include: {
      authors: true,
    },
    take: 5,
  })

  return {
    props: JSON.parse(JSON.stringify({ popularBooks, user, genres })),
  }
}

export default Home
