import Head from 'next/head'
import { Prisma, PrismaClient } from '@prisma/client'
import { Row, Col, Tabs, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useLazyQuery, gql } from '@apollo/client'

import ContentCard from '@src/components/ContentCard'


const AuthorsQuery = gql`
  query Authors($query: String!) {
    authors(query: $query) {
      id
      name
      slug
    }
  }
`

const GenresQuery = gql`
  query Genres($query: String!) {
    genres(query: $query) {
      id
      name
      slug
    }
  }
`


const bookWithAuthors = Prisma.validator<Prisma.BookArgs>()({
  include: { authors: true },
})
type BookWithAuthors = Prisma.BookGetPayload<typeof bookWithAuthors>

export interface Props {
  books: BookWithAuthors[]
  query: string
}


const Search = ({ books, query }: Props) => {
  const [getAuthors, { loading: authorsLoading, data: authorsData }] = useLazyQuery(AuthorsQuery)
  const [getGenres, { loading: genresLoading, data: genresData }] = useLazyQuery(GenresQuery)

  return (
    <>
      <Head>
        <title>{query}</title>
      </Head>

      <Tabs
        defaultActiveKey='books'
        onChange={key => {
          if (key === 'authors' && !authorsData) getAuthors({ variables: { query } })
          if (key === 'genres' && !genresData) getGenres({ variables: { query } })
        }}
      >
        <Tabs.TabPane tab='Books' key='books'>
          <Row gutter={20}>
            {books.map(({ id, slug, title, cover, authors }) => (
              <Col key={id}>
                <ContentCard
                  url={`/book/${slug}`}
                  title={title}
                  cover={cover}
                  description={authors.map(({ name }) => name).join(', ')}
                  rating={4.5}
                  owned
                />
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab='Authors' key='authors'>
          {
            (authorsLoading || !authorsData)
              ? (
                <Row justify='center'>
                  <Col>
                    <Spin indicator={<LoadingOutlined />} />
                  </Col>
                </Row>
              )
              : (
                <Row gutter={20}>
                  {authorsData.authors.map(({ id, name, slug }) => (
                    <Col key={id}>
                      <ContentCard url={`/author/${slug}`} title={name} />
                    </Col>
                  ))}
                </Row>
              )
          }
        </Tabs.TabPane>

        <Tabs.TabPane tab='Genres' key='genres'>
          {
            (genresLoading || !genresData)
              ? (
                <Row justify='center'>
                  <Col>
                    <Spin indicator={<LoadingOutlined />} />
                  </Col>
                </Row>
              )
              : (
                <Row gutter={20}>
                  {genresData.genres.map(({ id, name, slug }) => (
                    <Col key={id}>
                      <ContentCard url={`/genre/${slug}`} title={name} />
                    </Col>
                  ))}
                </Row>
              )
          }
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}


const prisma = new PrismaClient()
export const getServerSideProps = async ({ query: { query } }) => {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { genres: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { authors: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    include: { authors: true },
  })

  return {
    props: JSON.parse(JSON.stringify({ books, query })),
  }
}

export default Search
