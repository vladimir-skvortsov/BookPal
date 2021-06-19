import { ReactElement } from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'


export interface Props {
  styleTags: ReactElement
}


class MyDocument extends Document<Props> {
  static getInitialProps = ({ renderPage }) => {
    const sheet = new ServerStyleSheet()
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
    const styleTags = sheet.getStyleElement()

    return { ...page, styleTags }
  }

  render = () => {
    const { styleTags } = this.props

    return (
      <Html>
        <Head>
          {styleTags}
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}


export default MyDocument
