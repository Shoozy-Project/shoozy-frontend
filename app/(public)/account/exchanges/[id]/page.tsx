import { ExchangeDetail } from '@/components/account/ExchangeDetail';
export default async function ExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ExchangeDetail exchangeId={id} />; }
