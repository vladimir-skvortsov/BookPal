import { Prisma } from '@prisma/client'


const bookWithReviews = Prisma.validator<Prisma.BookArgs>()({
  include: { reviews: { include: { user: true } } },
})
type BookWithReviews = Prisma.BookGetPayload<typeof bookWithReviews>


const getRating = (book: BookWithReviews): number => {
  if (book.reviews.length) {
    const ratingSum = book.reviews.map(({ rating }) => rating).reduce((accumulator, current) => accumulator + current)
    const rating = Math.floor(ratingSum / book.reviews.length * 10) / 10

    return rating
  } else {
    return 0
  }
}


export default getRating
