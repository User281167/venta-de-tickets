import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../../../test/test-utils';
import { RegisterForm } from '../RegisterForm';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/features/auth/api/auth.client', () => ({
  signUp: vi.fn().mockResolvedValue({ success: true, error: null }),
  signInWithGoogle: vi.fn(),
}));

describe('RegisterForm', () => {
  it('renders registration form fields', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('shows success message after valid submission', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText('correo@ejemplo.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await user.type(screen.getByPlaceholderText('Repite tu contraseña'), 'password123');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await user.click(screen.getByText('Registrarse'));

    expect(await screen.findByText('Revisa tu correo')).toBeInTheDocument();
    expect(screen.getByText('Ir a iniciar sesión')).toBeInTheDocument();
  });
});
