import type { Metadata } from 'next';
import ReviewsClient from '@/components/admin/reviews/ReviewsClient';

export const metadata: Metadata = {
  title: 'Product Reviews | Shoezy Admin',
  description: 'Moderate customer shoe reviews, approve star ratings, and manage product feedback.',
};

export default function AdminReviewsPage() {
  return <ReviewsClient />;
}
