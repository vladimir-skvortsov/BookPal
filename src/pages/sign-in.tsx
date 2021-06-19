import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Row, Col, Typography, Divider, Form, Input, Button, message } from 'antd'
import { signIn } from 'next-auth/client'


const SignIn = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>

      <Row justify='center'>
        <Col span={8}>
          <Typography.Title>Sign In</Typography.Title>

          <Divider />

          <Form
            layout='vertical'
            onFinish={async ({ email, password }) => {
              const { ok } = await signIn('credentials', { email, password, redirect: false })

              if (ok) {
                router.push('/')
                message.success('You\'ve signed in')
              } else {
                message.error('Something went wrong')
              }
            }}
          >
            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Incorrect email' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' block>Sign In</Button>
            </Form.Item>
          </Form>

          <Divider />

          <Typography.Text>
            <Link href='/sign-up'><a>Sign up</a></Link> if you don't have an account yet
          </Typography.Text>
        </Col>
      </Row>
    </>
  )
}


export default SignIn
