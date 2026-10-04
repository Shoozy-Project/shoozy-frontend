import { ReturnDetail } from '@/components/account/ReturnDetail';
export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ReturnDetail returnId={id} />; }
