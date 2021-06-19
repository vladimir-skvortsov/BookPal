import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMutation, gql } from '@apollo/client'
import { Row, Col, Typography, Divider, Form, Input, Button, message } from 'antd'
import { signIn } from 'next-auth/client'


const SignUpQuery = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      id
    }
  }
`


const SignUp = () => {
  const router = useRouter()
  const [signUp, { loading }] = useMutation(SignUpQuery)

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>

      <Row justify='center'>
        <Col span={8}>
          <Typography.Title>Sign Up</Typography.Title>

          <Divider />

          <Form
            layout='vertical'
            onFinish={async ({ email, password }) => {
              try {
                await signUp({ variables: { email, password } })
                await signIn('credentials', { email, password, redirect: false })
                router.push('/')

                message.success('You\'ve signed up')
              } catch (error) {
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
              <Button loading={loading} type='primary' htmlType='submit' block>Sign Up</Button>
            </Form.Item>
          </Form>

          <Divider />

          <Typography.Text>
            <Link href='/sign-in'><a>Sign in</a></Link> if you already have an account
          </Typography.Text>
        </Col>
      </Row>
    </>
  )
}


export default SignUp
