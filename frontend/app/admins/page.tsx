"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { Sidebar } from './_components/Sidebar';
import { Header } from './_components/Header';
import { NewDashboard } from './_components/NewDashboard';
import { SchedulePage } from './_views/SchedulePage';
import { EmployeesPage } from './_views/EmployeesPage';
import { CustomersPage } from './_views/CustomersPage';
import { SupportPage } from './_views/SupportPage';
import { EquipmentPage } from './_views/EquipmentPage';
import { PackagesPage } from './_views/PackagesPage';
import { RevenuePage } from './_views/RevenuePage';
import { FacilityPage } from './_views/FacilityPage';

export default function AdminsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
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
      if (user.role !== 'AD') {
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

  const getPageTitle = (): string => {
    switch (activeMenu) {
      case 'dashboard':
        return 'Trang chủ';
      case 'schedule':
        return 'Lịch làm việc';
      case 'staff':
        return 'Quản lý nhân viên';
      case 'members':
        return 'Quản lý hội viên';
      case 'feedback':
        return 'Chăm sóc khách hàng';
      case 'equipment':
        return 'Quản lý thiết bị';
      case 'gym':
        return 'Thông tin phòng tập';
      case 'packages':
        return 'Quản lý gói tập';
      case 'revenue':
        return 'Doanh thu';
      default:
        return 'GymPro Management';
    }
  };

  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <NewDashboard />;
      case 'schedule':
        return <SchedulePage />;
      case 'staff':
        return <EmployeesPage />;
      case 'members':
        return <CustomersPage />;
      case 'feedback':
        return <SupportPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'gym':
        return <FacilityPage />;
      case 'packages':
        return <PackagesPage />;
      case 'revenue':
        return <RevenuePage />;
      default:
        return (
          <div className="bg-[var(--card)] rounded-xl p-8 border border-[var(--border)] shadow-sm text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Tính năng đang được phát triển
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Chức năng này sẽ được cập nhật trong phiên bản tiếp theo
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        <div className="ml-64">
          <Header
            pageTitle={getPageTitle()}
            onLogout={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            }}
          />

          <main className="pt-16 p-6">{renderPage()}</main>
        </div>
      </div>
    </>
  );
}
