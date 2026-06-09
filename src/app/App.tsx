import { useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NewDashboard } from './components/NewDashboard';
import { SchedulePage } from './pages/SchedulePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { CustomersPage } from './pages/CustomersPage';
import { SupportPage } from './pages/SupportPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { PackagesPage } from './pages/PackagesPage';
import { RevenuePage } from './pages/RevenuePage';
import { FacilityPage } from './pages/FacilityPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PTSidebar } from './components/PTSidebar';
import { PTHeader } from './components/PTHeader';
import { PTSchedulePage } from './pages/pt/PTSchedulePage';
import { PTTraineesPage } from './pages/pt/PTTraineesPage';
import { PTWorkoutsPage } from './pages/pt/PTWorkoutsPage';
import { PTEvaluationsPage } from './pages/pt/PTEvaluationsPage';
import { UserHeader } from './components/UserHeader';
import { UserDashboard } from './components/UserDashboard';
import { UserProfilePage } from './pages/UserProfilePage';
import { UserMembershipPage } from './pages/UserMembershipPage';
import { UserSchedulePage } from './pages/UserSchedulePage';
import { UserBodyTrackerPage } from './pages/UserBodyTrackerPage';
import { BookingModal } from './components/BookingModal';
import { StaffSidebar } from './components/StaffSidebar';
import { StaffHeader } from './components/StaffHeader';
import { StaffCheckinPage } from './pages/staff/StaffCheckinPage';
import { StaffSalesPage } from './pages/staff/StaffSalesPage';
import { StaffFeedbackPage } from './pages/staff/StaffFeedbackPage';
import { StaffSchedulePage } from './pages/staff/StaffSchedulePage';
import { StaffMembersPage } from './pages/staff/StaffMembersPage';
import { UserCheckinPage } from './pages/UserCheckinPage';
import { UserSupportPage } from './pages/UserSupportPage';

type UserRole = 'admin' | 'pt' | 'user' | 'staff' | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [ptCreatePlanTrigger, setPtCreatePlanTrigger] = useState(0);

  // If not authenticated, show login or register page
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <>
          <Toaster position="top-right" richColors />
          <RegisterPage
            onRegister={() => {
              setIsAuthenticated(true);
              setUserRole('user');
              setShowRegister(false);
            }}
            onBackToLogin={() => setShowRegister(false)}
          />
        </>
      );
    }
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage
          onLogin={(role: 'admin' | 'pt' | 'user' | 'staff') => {
            setIsAuthenticated(true);
            setUserRole(role);
            // Reset menu based on role
            if (role === 'pt') {
              setActiveMenu('schedule');
            } else if (role === 'staff') {
              setActiveMenu('sales');
            } else {
              setActiveMenu('dashboard');
            }
          }}
          onGoToRegister={() => setShowRegister(true)}
        />
      </>
    );
  }

  // User Dashboard
  if (userRole === 'user') {
    const getUserPageTitle = (): string => {
      switch (activeMenu) {
        case 'dashboard': return 'TỔNG QUAN';
        case 'schedule': return 'LỊCH TẬP CỦA TÔI';
        case 'membership': return 'GÓI TẬP & DỊCH VỤ';
        case 'checkin': return 'THẺ ĐIỆN TỬ';
        case 'tracker': return 'CHỈ SỐ CƠ THỂ';
        case 'support': return 'PHẢN HỒI & KHIẾU NẠI';
        default: return 'TỔNG QUAN';
      }
    };

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
      <>
        <Toaster position="top-right" richColors />
        <div className="min-h-screen bg-[#121212]">
          <UserHeader
            activeMenu={activeMenu}
            onMenuClick={setActiveMenu}
            onOpenBooking={() => setShowBookingModal(true)}
            onLogout={() => {
              setIsAuthenticated(false);
              setUserRole(null);
            }}
          />

          <main>{renderUserPage()}</main>

          <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
        </div>
      </>
    );
  }

  // PT Dashboard
  if (userRole === 'pt') {
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
                setIsAuthenticated(false);
                setUserRole(null);
              }}
            />

            <main className="pt-16 p-6">{renderPTPage()}</main>
          </div>
        </div>
      </>
    );
  }

  // Staff Dashboard
  if (userRole === 'staff') {
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
              onLogout={() => { setIsAuthenticated(false); setUserRole(null); }}
            />
            <main className="pt-16 p-6">{renderStaffPage()}</main>
          </div>
        </div>
      </>
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

  // Admin Dashboard (default)
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        <div className="ml-64">
          <Header
            pageTitle={getPageTitle()}
            onLogout={() => {
              setIsAuthenticated(false);
              setUserRole(null);
            }}
          />

          <main className="pt-16 p-6">{renderPage()}</main>
        </div>
      </div>
    </>
  );
}