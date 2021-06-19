import React from 'react'
import { FileImageOutlined } from '@ant-design/icons'
import styled from 'styled-components'


const Image = styled.img`
  width: 200px;
  height: 300px;
  object-fit: cover;
`

const Placeholder = styled.div`
  width: 200px;
  height: 300px;
  background: #eee;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`


export interface Props {
  src?: string
}


const Cover = ({ src }: Props) => {
  if (!src) {
    return (
      <Placeholder>
        <FileImageOutlined style={{ fontSize: 24 }} />
      </Placeholder>
    )
  }

  return <Image alt='' src={src} />
}


export default Cover
