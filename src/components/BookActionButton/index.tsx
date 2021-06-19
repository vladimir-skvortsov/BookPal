import React from 'react'
import Link from 'next/link'
import { useMutation, gql } from '@apollo/client'
import { Button } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { Prisma, Book, User } from '@prisma/client'


const AddBookToUserQuery = gql`
  mutation AddBookToUser($bookId: String!) {
    addBookToUser(bookId: $bookId) {
      id
    }
  }
`

const RemoveBookFromUserQuery = gql`
  mutation RemoveBookFromUser($bookId: String!) {
    removeBookFromUser(bookId: $bookId) {
      id
    }
  }
`


const userWithBooks = Prisma.validator<Prisma.UserArgs>()({
  include: { books: true },
})
type UserWithBooks = Prisma.UserGetPayload<typeof userWithBooks>

export interface Props {
  book: Book
  user: UserWithBooks | null

  refetch: () => void
}


const BookActionButton = ({ book, user, refetch }: Props) => {
  const [addBookToUser, { loading: addBookToUserLoading }] = useMutation(AddBookToUserQuery)
  const [removeBookFromUser, { loading: removeBookFromUserLoading }] = useMutation(RemoveBookFromUserQuery)

  if (!user) {
    return (
      <Link href='/sign-in'>
        <Button type='primary'>Sign in to read</Button>
      </Link>
    )
  }

  if (user.books.some(({ id }) => id === book.id)) {
    return (
      <Button
        icon={<CloseOutlined />}
        loading={removeBookFromUserLoading}
        onClick={async () => {
          await removeBookFromUser({ variables: { bookId: book.id } })
          refetch()
        }}
      >
        Remove
      </Button>
    )
  }

  return (
    <Button
      type='primary'
      icon={<PlusOutlined />}
      loading={addBookToUserLoading}
      onClick={async () => {
        await addBookToUser({ variables: { bookId: book.id } })
        refetch()
      }}
    >
      Add
    </Button>
  )
}


export default BookActionButton
