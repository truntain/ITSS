"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { StaffSidebar } from './_components/StaffSidebar';
import { StaffHeader } from './_components/StaffHeader';
import { StaffSalesPage } from './_views/StaffSalesPage';
import { StaffCheckinPage } from './_views/StaffCheckinPage';
import { StaffMembersPage } from './_views/StaffMembersPage';
import { StaffFeedbackPage } from './_views/StaffFeedbackPage';
import { StaffSchedulePage } from './_views/StaffSchedulePage';

export default function StaffsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('sales');
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');
    if (!token || !userStr) {
      router.replace('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'NV') {
        router.replace('/login');
        return;
      }
      setAuthorized(true);
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

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
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            }}
          />
          <main className="pt-16 p-6">{renderStaffPage()}</main>
        </div>
      </div>
    </>
  );
}
