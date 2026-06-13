"use client";

import { useState } from 'react';
import { Toaster } from 'sonner';
import { UserHeader } from './_components/UserHeader';
import { UserDashboard } from './_components/UserDashboard';
import { UserSchedulePage } from './_views/UserSchedulePage';
import { UserMembershipPage } from './_views/UserMembershipPage';
import { UserCheckinPage } from './_views/UserCheckinPage';
import { UserBodyTrackerPage } from './_views/UserBodyTrackerPage';
import { UserSupportPage } from './_views/UserSupportPage';
import { UserProfilePage } from './_views/UserProfilePage';
import { UserEvaluationsPage } from './_views/UserEvaluationsPage';
import { BookingModal } from './_components/BookingModal';
import { AuthGuard } from '../../components/AuthGuard';

export default function MembersPage() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const renderUserPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <UserDashboard onMenuClick={setActiveMenu} />;
      case 'schedule':
        return <UserSchedulePage />;
      case 'membership':
        return <UserMembershipPage />;
      case 'checkin':
        return <UserCheckinPage />;
      case 'tracker':
        return <UserBodyTrackerPage />;
      case 'evaluations':
        return <UserEvaluationsPage />;
      case 'support':
        return <UserSupportPage />;
      case 'profile':
        return <UserProfilePage />;
      default:
        return (
          <div className="max-w-[1440px] mx-auto px-8 py-20">
            <div className="bg-[#242424] border border-[#333333] rounded-lg p-12 shadow-xl text-center">
              <h2 className="text-3xl font-black text-white mb-3 uppercase">Tính năng đang được phát triển</h2>
              <p className="text-[#A0A0A0] text-lg">Chức năng này sẽ được cập nhật trong phiên bản tiếp theo</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthGuard allowedRoles={['HV']}>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[#121212]">
        <UserHeader
          activeMenu={activeMenu}
          onMenuClick={setActiveMenu}
          onOpenBooking={() => setShowBookingModal(true)}
          onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }}
        />

        <main>{renderUserPage()}</main>

        <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
      </div>
    </AuthGuard>
  );
}
