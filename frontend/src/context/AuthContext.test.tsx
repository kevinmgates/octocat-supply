import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Helper component to expose auth state for assertions
function AuthStateDisplay() {
    const { isLoggedIn, isAdmin } = useAuth();
    return (
        <div>
            <span data-testid="logged-in">{String(isLoggedIn)}</span>
            <span data-testid="is-admin">{String(isAdmin)}</span>
        </div>
    );
}

// Helper component for testing login/logout actions
function AuthActions() {
    const { isLoggedIn, isAdmin, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="logged-in">{String(isLoggedIn)}</span>
            <span data-testid="is-admin">{String(isAdmin)}</span>
            <button
                data-testid="login-user"
                onClick={() => login('user@example.com', 'password')}
            />
            <button
                data-testid="login-admin"
                onClick={() => login('admin@github.com', 'password')}
            />
            <button
                data-testid="logout"
                onClick={logout}
            />
        </div>
    );
}

describe('AuthContext', () => {
    it('provides initial unauthenticated state', () => {
        render(
            <AuthProvider>
                <AuthStateDisplay />
            </AuthProvider>
        );
        expect(screen.getByTestId('logged-in').textContent).toBe('false');
        expect(screen.getByTestId('is-admin').textContent).toBe('false');
    });

    it('sets isLoggedIn to true after login with valid credentials', async () => {
        render(
            <AuthProvider>
                <AuthActions />
            </AuthProvider>
        );
        await act(async () => {
            screen.getByTestId('login-user').click();
        });
        expect(screen.getByTestId('logged-in').textContent).toBe('true');
    });

    it('sets isAdmin to false for a non-github.com email', async () => {
        render(
            <AuthProvider>
                <AuthActions />
            </AuthProvider>
        );
        await act(async () => {
            screen.getByTestId('login-user').click();
        });
        expect(screen.getByTestId('is-admin').textContent).toBe('false');
    });

    it('sets isAdmin to true for a @github.com email', async () => {
        render(
            <AuthProvider>
                <AuthActions />
            </AuthProvider>
        );
        await act(async () => {
            screen.getByTestId('login-admin').click();
        });
        expect(screen.getByTestId('is-admin').textContent).toBe('true');
        expect(screen.getByTestId('logged-in').textContent).toBe('true');
    });

    it('resets state after logout', async () => {
        render(
            <AuthProvider>
                <AuthActions />
            </AuthProvider>
        );
        await act(async () => {
            screen.getByTestId('login-admin').click();
        });
        expect(screen.getByTestId('logged-in').textContent).toBe('true');
        expect(screen.getByTestId('is-admin').textContent).toBe('true');

        await act(async () => {
            screen.getByTestId('logout').click();
        });
        expect(screen.getByTestId('logged-in').textContent).toBe('false');
        expect(screen.getByTestId('is-admin').textContent).toBe('false');
    });

    it('throws an error when useAuth is used outside AuthProvider', () => {
        // Suppress expected console error from React
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<AuthStateDisplay />)).toThrow(
            'useAuth must be used within an AuthProvider'
        );
        consoleSpy.mockRestore();
    });
});
