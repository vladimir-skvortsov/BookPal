import Head from 'next/head'
import Link from 'next/link'
import { getSession } from 'next-auth/client'
import { Row, Col, Typography, Divider } from 'antd'
import { Prisma, PrismaClient } from '@prisma/client'

import ContentCard from '@src/components/ContentCard'


const userWithBooks = Prisma.validator<Prisma.UserArgs>()({
  include: { books: { include: { authors: true } } },
})
type UserWithBooks = Prisma.UserGetPayload<typeof userWithBooks>

export interface Props {
  user: UserWithBooks | null
}


const Library = ({ user }: Props) => {
  if (!user) {
    return (
      <>
        <Head>
          <title>Library</title>
        </Head>

        <Typography.Title>You have to sign in</Typography.Title>

        <Link href='/'>
          <a>Sign in</a>
        </Link>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Library</title>
      </Head>

      <Typography.Title>Library</Typography.Title>

      <Divider />

      <Row gutter={[20, 20]}>
        {user.books.map(({ id, slug, title, cover, authors }) => (
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
export const getServerSideProps = async ({ req }) => {
  const session = await getSession({ req })
  const user = session && await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { books: true },
  })

  return {
    props: JSON.parse(JSON.stringify({ user })),
  }
}

export default Library
