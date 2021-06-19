import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { CheckOutlined } from '@ant-design/icons'
import { Row, Col, Card, Rate } from 'antd'

import Cover from '@src/components/Cover'


const StyledCard = styled(Card)`
  width: 200px;
  height: 420px;
`

export const Meta = styled(Card.Meta)`
  padding-bottom: 10px;

  & * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`


export interface Props {
  url?: string
  title: string
  cover?: string
  description?: string
  rating?: number
  owned?: boolean
}


const ContentCard = ({ url, title, cover, description, rating, owned }: Props) => {
  const { push } = useRouter()

  return (
    <StyledCard
      cover={<Cover src={cover && `data:image/png;base64, ${cover}`} />}
      onClick={() => url && push(url)}
      hoverable
    >
      <Meta title={title} description={description} />

      <Row justify='space-between' align='middle'>
        <Col>
          {rating && <Rate allowHalf disabled defaultValue={rating} style={{ fontSize: 14 }} />}
        </Col>

        <Col>
          {owned === true && <CheckOutlined />}
        </Col>
      </Row>
    </StyledCard>
  )
}


export default ContentCard
