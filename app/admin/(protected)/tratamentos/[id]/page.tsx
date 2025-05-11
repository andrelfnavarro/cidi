import { Suspense } from 'react';
import TreatmentDetails from '@/components/admin/treatment-details';
import { Skeleton } from '@/components/ui/skeleton';

export default async function TreatmentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={<TreatmentDetailsSkeleton />}>
        <TreatmentDetails treatmentId={id} />
      </Suspense>
    </div>
  );
}

function TreatmentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
