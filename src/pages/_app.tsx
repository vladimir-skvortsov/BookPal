import { Layout } from 'antd'
import { Provider as AuthProvider } from 'next-auth/client'
import { ApolloProvider } from '@apollo/client';
import styled, { ThemeProvider } from 'styled-components'
import client from '@src/utils/apolloClient'

import theme from '@src/data/theme'

import GlobalStyles from '@src/components/GlobalStyles'
import Header from '@src/components/Header'

import 'antd/dist/antd.less'


const Content = styled(Layout.Content)`
  background: ${({ theme: { primaryColor } }) => primaryColor};
  padding: 100px 50px 50px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
`

const PageContainer = styled.div`
  max-width: 1280px;
  width: 100%;
`


const App = ({ Component, pageProps }) => (
  <AuthProvider session={pageProps.session}>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />

        <Layout>
          <Header />

          <Content>
            <PageContainer>
              <Component {...pageProps} />
            </PageContainer>
          </Content>
        </Layout>
      </ThemeProvider>
    </ApolloProvider>
  </AuthProvider>
)


export default App
