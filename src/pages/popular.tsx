import Head from 'next/head'
import Link from 'next/link'
import { getSession } from 'next-auth/client'
import { Row, Col, Typography, Divider } from 'antd'
import { Prisma, PrismaClient } from '@prisma/client'

import ContentCard from '@src/components/ContentCard'


const bookWithAuthors = Prisma.validator<Prisma.BookArgs>()({
  include: { authors: true },
})
type BookWithAuthors = Prisma.BookGetPayload<typeof bookWithAuthors>

export interface Props {
  books: BookWithAuthors[]
}


const Popular = ({ books }) => (
  <>
    <Head>
      <title>Popular</title>
    </Head>

    <Typography.Title>Popular</Typography.Title>

    <Divider />

    <Row gutter={[20, 20]}>
      {books.map(({ id, slug, title, cover, authors }) => (
        <Col id={id}>
          <ContentCard
            url={`/book/${slug}`}
            title={title}
            cover={cover}
            description={authors.map(({ name }) => name).join(', ')}
          />
        </Col>
      ))}
    </Row>
  </>
)


const prisma = new PrismaClient()
export const getServerSideProps = async () => {
  const books = await prisma.book.findMany({
    orderBy: {
      users: {
        _count: 'desc',
      },
    },
    include: { authors: true },
    take: 20,
  })

  return {
    props: JSON.parse(JSON.stringify({ books })),
  }
}

export default Popular
