import React, { useState, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Space, Avatar, Rate, Typography, Form, Comment, Tooltip, Popconfirm } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Prisma, Book, Review, User } from '@prisma/client'
import moment from 'moment'


const UpdateReviewMutation = gql`
  mutation UpdateReview($bookId: String!, $data: UpdateReviewData!) {
    updateReview(bookId: $bookId, data: $data) {
      id
    }
  }
`

const DeleteReviewMutation = gql`
  mutation DeleteReview($bookId: String!) {
    deleteReview(bookId: $bookId) {
      id
    }
  }
`


const reviewWithUser = Prisma.validator<Prisma.ReviewArgs>()({
  include: { user: true },
})
type ReviewWithUser = Prisma.ReviewGetPayload<typeof reviewWithUser>

export interface Props {
  book: Book
  review: ReviewWithUser
  user?: User | null

  refetch?: () => void
}


const ReviewComponent = ({ book, review, user, refetch }: Props) => {
  const [updateReview] = useMutation(UpdateReviewMutation)
  const [deleteReview] = useMutation(DeleteReviewMutation)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const isEditingActions = [
    <span
      onClick={async () => {
        await updateReview({ variables: { bookId: book.id, data: form.getFieldsValue() } })
        setIsEditing(false)

        if (refetch) {
          refetch()
        }
      }}
    >
      Save
    </span>,
    <span
      onClick={() => {
        form.resetFields()
        setIsEditing(false)
      }}
    >
      Cancel
    </span>,
  ]
  const defaultActions = [
    <span onClick={() => setIsEditing(true)}>Edit</span>
  ]

  return (
    <Comment
      actions={review.user.id === user?.id && [
        ...(isEditing ? isEditingActions : defaultActions),

        <Popconfirm
          title='Are you sure?'
          onConfirm={async () => {
            await deleteReview({ variables: { bookId: book.id } })

            if (refetch) {
              refetch()
            }
          }}
        >
          <span>Delete</span>
        </Popconfirm>,
      ]}
      author={review.user.email}
      avatar={
        <Avatar
          icon={<UserOutlined />}
          alt={review.user.email}
        />
      }
      content={
        <Form form={form}>
          <Space direction='vertical'>
            <Form.Item name='rating' initialValue={review.rating} noStyle>
              <Rate disabled={!isEditing} />
            </Form.Item>

            <Form.Item name='text' initialValue={review.text} valuePropName='children' noStyle>
              <Typography.Text
                editable={{
                  editing: isEditing,
                  icon: () => null,
                  onChange: text => form.setFieldsValue({ text })
                }}
              />
            </Form.Item>
          </Space>
        </Form>
      }
      datetime={
        <Tooltip title={moment(review.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment(review.createdAt).fromNow()}</span>
        </Tooltip>
      }
    />
  )
}


export default ReviewComponent
