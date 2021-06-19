import React from 'react'
import styled from 'styled-components'
import { Row, Col, Typography, Button } from 'antd'
import { Book } from '@prisma/client'
import Link from 'next/link'

import ContentCard from '@src/components/ContentCard'


const CardsRow = styled(Row)`
  height: 420px;
  overflow: hidden;
`


export interface Props {
  title: string
  books: Book[]
  url?: string
}


const BooksSection = ({ title, books, url }) => (
  <div>
    <Row justify='space-between'>
      <Col>
        <Typography.Title level={2}>{title}</Typography.Title>
      </Col>

      {url && (
        <Col>
          <Link href={url}>
            <Button>See more</Button>
          </Link>
        </Col>
      )}
    </Row>

    <CardsRow gutter={20}>
      {books.map(({ id, slug, title, cover, authors }) => (
        <Col key={id}>
          <ContentCard
            url={`/book/${slug}`}
            title={title}
            cover={cover}
            description={authors.map(({ name }) => name).join(', ')}
          />
        </Col>
      ))}
    </CardsRow>
  </div>
)


export default BooksSection
