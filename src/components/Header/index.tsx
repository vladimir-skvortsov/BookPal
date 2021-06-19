import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout, Row, Col, Form, Input, Button, Dropdown, Menu } from 'antd'
import styled from 'styled-components'
import { useSession, signOut } from 'next-auth/client'


const Container = styled(Layout.Header)`
  position: absolute;
  background: none !important;
  border-bottom: 1px solid #e8e8e8;
  height: auto;
  width: 100%;
`

const Title = styled.h1`
  margin: 0;
`


const Header = () => {
  const router = useRouter()
  const [session] = useSession()

  return (
    <Container>
      <Row align='middle' justify='space-between'>
        <Col>
          <Link href='/'>
            <a><Title>BookPal</Title></a>
          </Link>
        </Col>

        <Col span={6}>
          <Form
            onFinish={({ query }) => {
              if (query) {
                router.push(`/search/${encodeURIComponent(query)}`)
              }
            }}
          >
            <Form.Item name='query' noStyle>
              <Input.Search placeholder='Search' />
            </Form.Item>
          </Form>
        </Col>

        <Col>
            {
              session
                ? (
                  <Dropdown
                    overlay={(
                      <Menu>
                        <Menu.Item
                          danger
                          onClick={async () => {
                            await signOut({ redirect: false })
                            router.replace(router.asPath)
                          }}
                        >
                          Sign Out
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <Button type='link'>
                      {session.user.email}
                    </Button>
                  </Dropdown>
                )
                : (
                  <Link href='/sign-in'>
                    <Button type='link'>Sign In</Button>
                  </Link>
                )
            }
        </Col>
      </Row>
    </Container>
  )
}


export default Header