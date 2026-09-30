import { Star, MoreVertical, Trash2, Edit } from 'lucide-react';
import { PublicReviewDto } from '@/lib/api/reviews';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ReviewCardProps {
  review: PublicReviewDto;
  isOwner: boolean;
  onDelete: (id: string) => void;
  onEdit: (review: PublicReviewDto) => void;
}

export function ReviewCard({ review, isOwner, onDelete, onEdit }: ReviewCardProps) {
  const { rating, title, body, reviewer, createdAt } = review;
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt));

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-8 mb-8 last:border-0 last:mb-0 last:pb-0">
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
              {reviewer?.firstName || 'Anonymous'} {reviewer?.lastInitial ? `${reviewer.lastInitial}.` : ''}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700 mx-1">•</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
              {formattedDate}
            </span>
          </div>
          
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= rating
                    ? 'fill-amber-500 text-amber-500'
                    : 'fill-neutral-100 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
        
        {isOwner && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl shadow-lg border-neutral-100 dark:border-neutral-800">
              <DropdownMenuItem onClick={() => onEdit(review)} className="cursor-pointer text-xs font-medium uppercase tracking-widest">
                <Edit className="mr-3 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(review.id)} className="text-red-600 cursor-pointer text-xs font-medium uppercase tracking-widest focus:text-red-700">
                <Trash2 className="mr-3 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {title && <h4 className="font-serif text-lg text-neutral-900 dark:text-neutral-100 leading-snug">{title}</h4>}
        {body && <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">{body}</p>}
      </div>
      
    </div>
  );
}
