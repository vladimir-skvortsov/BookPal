import React, { useEffect } from 'react'
import { Modal, Form, Input, Rate, Button, message } from 'antd'
import { useMutation, gql } from '@apollo/client'


const AddReviewMutation = gql`
  mutation AddReview($bookId: String!, $data: AddReviewData!) {
    addReview(bookId: $bookId, data: $data) {
      id
    }
  }
`


export interface Props {
  bookId: string
  visible: boolean

  onSubmit: () => void
  onClose: () => void
}


const WriteReviewModal = ({ bookId, visible, onSubmit, onClose }: Props) => {
  const [addReview, { loading }] = useMutation(AddReviewMutation)
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  }, [visible])

  return (
    <Modal
      title='Write review'
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={form.submit}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={async data => {
          try {
            await addReview({ variables: { bookId, data } })
            onSubmit()
          } catch (error) {
            message.error('Something went wrong')
          }
        }}
      >
        <Form.Item
          name='rating'
          rules={[{ required: true, message: 'Rating is required' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          label='Your opinion'
          name='text'
          rules={[{ required: true, message: 'Text is required' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  )
}


export default WriteReviewModal
