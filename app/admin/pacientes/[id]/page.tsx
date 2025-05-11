import { Suspense } from 'react';
import PatientDetails from '@/components/admin/patient-details';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={<PatientDetailsSkeleton />}>
        <PatientDetails patientId={params.id} />
      </Suspense>
    </div>
  );
}

function PatientDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}
