import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Row, Col, Typography, Divider } from 'antd'
import { Prisma, PrismaClient } from '@prisma/client'

import ContentCard from '@src/components/ContentCard'


const genresWithBooks = Prisma.validator<Prisma.GenreArgs>()({
  include: { books: { include: { authors: true } } },
})
type GenreWithBooks = Prisma.GenreGetPayload<typeof genresWithBooks>

export interface Props {
  genre: GenreWithBooks | null
}


const GenrePage = ({ genre }: Props) => {
  if (!genre) {
    return (
      <>
        <Head>
          <title>There's no such genre</title>
        </Head>

        <Typography.Title>There's no such genre</Typography.Title>

        <Link href='/'>
          <a>Go back to home</a>
        </Link>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{genre.name}</title>
      </Head>

      <Typography.Title>{genre.name}</Typography.Title>

      <Divider />

      <Row gutter={[20, 20]}>
        {genre.books.map(({ id, slug, title, cover, authors }) => (
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
  const genre = await prisma.genre.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: { books: { include: { authors: true } } },
  })

  return {
    props: JSON.parse(JSON.stringify({ genre })),
  }
}


export default GenrePage
