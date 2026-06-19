import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../page';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock toast.error và toast.success để assert trực tiếp
vi.mock('sonner', async () => {
  const actual = await vi.importActual<typeof import('sonner')>('sonner');
  return {
    ...actual,
    toast: {
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('hiển thị đầy đủ form đăng nhập', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi validate khi gửi form trống', async () => {
    render(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Vui lòng nhập email')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
  });

  it('hiển thị lỗi khi đăng nhập sai thông tin', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(emailInput, { target: { value: 'wrong@gympro.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email hoặc mật khẩu không hợp lệ!');
    });

    expect(screen.getByText('⚠️ Email hoặc mật khẩu không hợp lệ!')).toBeInTheDocument();
  });

  it('đăng nhập thành công với vai trò Admin và lưu thông tin vào localStorage', async () => {
    const router = useRouter();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });

    // Act: Nhập thông tin chính xác và click đăng nhập
    fireEvent.change(emailInput, { target: { value: 'admin@gympro.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitBtn);

    // Assert: Kỳ vọng Toast báo thành công, lưu localStorage và chuyển hướng trang
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Đăng nhập thành công!');
    });

    // Kiểm tra đã lưu vào localStorage
    expect(localStorage.getItem('token')).toBe('mock-jwt-token-12345');
    const userStr = localStorage.getItem('currentUser');
    expect(userStr).not.toBeNull();
    const user = JSON.parse(userStr!);
    expect(user.role).toBe('AD');

    // Kiểm tra router.push được gọi chuyển đến trang admins
    expect(router.push).toHaveBeenCalledWith('/admins');
  });

  it('cho phép ẩn/hiển thị mật khẩu khi bấm vào biểu tượng con mắt', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('Mật khẩu') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Tìm button toggle hiển thị mật khẩu
    // Button này chứa component Eye từ lucide-react, ta có thể tìm theo loại button
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });
});
