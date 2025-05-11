import React from 'react';
import PatientSearch from '@/components/admin/patient-search';
import AdvancedPatientSearch from '@/components/admin/advanced-patient-search';

export default function PacientesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PatientSearch />
      <AdvancedPatientSearch />
    </div>
  );
}
