import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Row, Col, Typography, Divider, Button, Rate, Space } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { getSession } from 'next-auth/client'
import { Prisma, PrismaClient } from '@prisma/client'

import BookActionButton from '@src/components/BookActionButton'
import WriteReviewModal from '@src/components/WriteReviewModal'
import Review from '@src/components/Review'
import Cover from '@src/components/Cover'

import getRating from '@src/utils/getRating'


const bookWithReviews = Prisma.validator<Prisma.BookArgs>()({
  include: { reviews: { include: { user: true } } },
})
type BookWithReviews = Prisma.BookGetPayload<typeof bookWithReviews>

const userWithBooks = Prisma.validator<Prisma.UserArgs>()({
  include: { books: true },
})
type UserWithBooks = Prisma.UserGetPayload<typeof userWithBooks>

export interface Props {
  book: BookWithReviews | null
  user: UserWithBooks | null
}


const BookPage = ({ book, user }: Props) => {
  if (!book) {
    return (
      <>
        <Head>
          <title>There's no such book</title>
        </Head>

        <Typography.Title>There's no such book</Typography.Title>

        <Link href='/'>
          <a>Go back to home</a>
        </Link>
      </>
    )
  }

  const router = useRouter()
  const [writeReviewModalVisible, setWriteReviewModalVisibility] = useState(false)
  const rating = getRating(book)

  const refreshData = () => router.replace(router.asPath)

  return (
    <>
      <Head>
        <title>{book.title}</title>
      </Head>

      <WriteReviewModal
        bookId={book.id}
        visible={writeReviewModalVisible}
        onSubmit={() => {
          refreshData()
          setWriteReviewModalVisibility(false)
        }}
        onClose={() => setWriteReviewModalVisibility(false)}
      />

      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Row gutter={20} wrap={false}>
            <Col>
              <Cover src={book.cover && `data:image/png;base64, ${book.cover}`} />
            </Col>

            <Col>
              <Row gutter={[0, 20]}>
                <Col span={24}>
                  <Typography.Title>{book.title}</Typography.Title>
                </Col>

                <Col>
                  <BookActionButton
                    book={book}
                    user={user}
                    refetch={refreshData}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Typography.Paragraph>{book.description}</Typography.Paragraph>
        </Col>

        <Divider />

        <Col span={24}>
          <Row justify='space-between'>
            <Col>
              <Space direction='vertical' align='center'>
                <Typography.Title level={2}>{rating}</Typography.Title>
                <Rate value={rating} allowHalf disabled />
              </Space>
            </Col>

            <Col>
              <Button icon={<EditOutlined />} onClick={() => setWriteReviewModalVisibility(true)}>
                Write a review
              </Button>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Space direction='vertical' size={20}>
            {
              book.reviews
                .sort(({ user: owner }) => owner.id === user?.id ? -1 : 1)
                .map(review => (
                  <Review
                    key={review.id}
                    book={book}
                    review={review}
                    user={user}
                    refetch={refreshData}
                  />
                ))
            }
          </Space>
        </Col>
      </Row>
    </>
  )
}


const prisma = new PrismaClient()
export const getServerSideProps = async ({ req, query: { idOrSlug } }) => {
  const session = await getSession({ req })
  const user = session && await prisma.user.findUnique({ where: { email: session.user.email }, include: { books: true } })
  const book = await prisma.book.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: { reviews: { include: { user: true } } },
  })

  return {
    props: JSON.parse(JSON.stringify({ book, user })),
  }
}


export default BookPage
