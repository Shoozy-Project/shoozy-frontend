import ReviewsClient from '@/components/admin/reviews/ReviewsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.reviewsTitle', 'meta.adminReviewsDescription');

export default function AdminReviewsPage() {
  return <ReviewsClient />;
}
