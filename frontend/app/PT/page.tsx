"use client";

import { useState } from 'react';
import { Toaster } from 'sonner';
import { PTSidebar } from './_components/PTSidebar';
import { PTHeader } from './_components/PTHeader';
import { PTSchedulePage } from './_views/PTSchedulePage';
import { PTTraineesPage } from './_views/PTTraineesPage';
import { PTWorkoutsPage } from './_views/PTWorkoutsPage';
import { PTEvaluationsPage } from './_views/PTEvaluationsPage';

export default function PTPage() {
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [ptCreatePlanTrigger, setPtCreatePlanTrigger] = useState(0);

  const getPTPageTitle = (): string => {
    switch (activeMenu) {
      case 'schedule':
        return 'Lịch làm việc';
      case 'clients':
        return 'Danh sách Hội viên';
      case 'workouts':
        return 'Bài tập & Giáo án';
      case 'tracking':
        return 'Đánh giá & Chỉ số';
      default:
        return 'Lịch làm việc';
    }
  };

  const renderPTPage = () => {
    switch (activeMenu) {
      case 'schedule':
        return <PTSchedulePage />;
      case 'clients':
        return <PTTraineesPage />;
      case 'workouts':
        return <PTWorkoutsPage triggerCreatePlan={ptCreatePlanTrigger} />;
      case 'tracking':
        return <PTEvaluationsPage />;
      default:
        return <PTSchedulePage />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-slate-50">
        <PTSidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        <div className="ml-64">
          <PTHeader
            pageTitle={getPTPageTitle()}
            showCreatePlanButton={activeMenu === 'workouts'}
            onCreatePlan={() => {
              setPtCreatePlanTrigger(Date.now());
            }}
            onLogout={() => {
              window.location.href = '/login';
            }}
          />

          <main className="pt-16 p-6">{renderPTPage()}</main>
        </div>
      </div>
    </>
  );
}
