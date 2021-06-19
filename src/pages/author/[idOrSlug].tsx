import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Row, Col, Typography, Divider } from 'antd'
import { Prisma, PrismaClient } from '@prisma/client'

import ContentCard from '@src/components/ContentCard'


const authorWithBooks = Prisma.validator<Prisma.AuthorArgs>()({
  include: { books: { include: { authors: true } } },
})
type AuthorWithBooks = Prisma.GenreGetPayload<typeof authorWithBooks>

export interface Props {
  author: AuthorWithBooks | null
}


const AuthorPage = ({ author }: Props) => {
  if (!author) {
    return (
      <>
        <Head>
          <title>There's no such author</title>
        </Head>

        <Typography.Title>There's no such author</Typography.Title>

        <Link href='/'>
          <a>Go back to home</a>
        </Link>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{author.name}</title>
      </Head>

      <Typography.Title>{author.name}</Typography.Title>

      <Divider />

      <Row gutter={[20, 20]}>
        {author.books.map(({ id, slug, title, cover, authors }) => (
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
}


const prisma = new PrismaClient()
export const getServerSideProps = async ({ query: { idOrSlug } }) => {
  const author = await prisma.author.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: { books: { include: { authors: true } } },
  })

  return {
    props: JSON.parse(JSON.stringify({ author })),
  }
}


export default AuthorPage
