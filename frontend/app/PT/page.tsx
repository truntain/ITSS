"use client";

import { useState } from 'react';
import { Toaster } from 'sonner';
import { PTSidebar } from './_components/PTSidebar';
import { PTHeader } from './_components/PTHeader';
import { PTSchedulePage } from './_views/PTSchedulePage';
import { PTTraineesPage } from './_views/PTTraineesPage';
import { PTWorkoutsPage } from './_views/PTWorkoutsPage';
import { PTEvaluationsPage } from './_views/PTEvaluationsPage';
import { PTProfilePage } from './_views/PTProfilePage';
import { PTFeedbackPage } from './_views/PTFeedbackPage';
import { AuthGuard } from '../../components/AuthGuard';

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
      case 'feedback':
        return 'Đánh giá & Nhận xét';
      case 'profile':
        return 'Hồ sơ cá nhân';
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
      case 'feedback':
        return <PTFeedbackPage />;
      case 'profile':
        return <PTProfilePage />;
      default:
        return <PTSchedulePage />;
    }
  };

  return (
    <AuthGuard allowedRoles={['PT']}>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-slate-50">
        <PTSidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        <div className="ml-64">
          <PTHeader
            pageTitle={getPTPageTitle()}
            showCreatePlanButton={false}
            onCreatePlan={() => {
              setPtCreatePlanTrigger(Date.now());
            }}
            onProfileClick={() => setActiveMenu('profile')}
            onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            }}
          />

          <main className="pt-16 p-6">{renderPTPage()}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
