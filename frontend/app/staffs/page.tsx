"use client";

import { useState } from 'react';
import { Toaster } from 'sonner';
import { StaffSidebar } from './_components/StaffSidebar';
import { StaffHeader } from './_components/StaffHeader';
import { StaffSalesPage } from './_views/StaffSalesPage';
import { StaffCheckinPage } from './_views/StaffCheckinPage';
import { StaffMembersPage } from './_views/StaffMembersPage';
import { StaffFeedbackPage } from './_views/StaffFeedbackPage';
import { StaffSchedulePage } from './_views/StaffSchedulePage';

export default function StaffsPage() {
  const [activeMenu, setActiveMenu] = useState('sales');

  const getStaffPageTitle = (): string => {
    switch (activeMenu) {
      case 'sales': return 'Bán hàng & Giao dịch tại quầy';
      case 'checkin': return 'Vận hành & Điểm danh';
      case 'members': return 'Hồ sơ & Lịch sử hội viên';
      case 'feedback': return 'Phản hồi hội viên';
      case 'schedule': return 'Lịch làm việc & Thông báo';
      default: return 'Bán hàng & Giao dịch tại quầy';
    }
  };

  const renderStaffPage = () => {
    switch (activeMenu) {
      case 'sales': return <StaffSalesPage />;
      case 'checkin': return <StaffCheckinPage />;
      case 'members': return <StaffMembersPage />;
      case 'feedback': return <StaffFeedbackPage />;
      case 'schedule': return <StaffSchedulePage />;
      default: return <StaffSalesPage />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[var(--background)]">
        <StaffSidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
        <div className="ml-64">
          <StaffHeader
            pageTitle={getStaffPageTitle()}
            onLogout={() => {
              window.location.href = '/login';
            }}
          />
          <main className="pt-16 p-6">{renderStaffPage()}</main>
        </div>
      </div>
    </>
  );
}
