import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:3001/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as any;
    
    if (email === 'admin@gympro.com' && password === '123456') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: 'admin@gympro.com',
          role: 'AD',
          fullName: 'Quản trị viên',
          phone: '0987654321',
        },
      });
    }
    
    return new HttpResponse(
      JSON.stringify({ message: 'Email hoặc mật khẩu không hợp lệ!' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),
];
