// __tests__/menu.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// IMPORTANT: Adjust this import path to your actual MenuPage component
// It was '@/app/../components/Menu' which looks incorrect. 
// It should likely be '@/app/menu/page' based on your file structure.
import MenuPage from '@/app/../components/Menu'; 
import type { MenuCategory } from '@/types/menu';

// Mock the MenuCategorySection component
jest.mock('@/components/menuCards/MenuCategorySection', () => ({
  __esModule: true,
  default: ({ category }: { category: MenuCategory }) => (
    <div data-testid={`category-${category.id}`}>{category.name} Section</div>
  ),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

// Helper to create a mock response for fetch
const createMockResponse = (ok: boolean, status: number, data: any, statusText?: string) => ({
  ok,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  statusText: statusText || (ok ? 'OK' : 'Error'),
});


describe('MenuPage Component', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    mockFetch.mockClear();

    // --- CORRECT WAY TO MOCK window.location.reload ---
    // Delete the original location property (if it exists and is deletable, often not)
    // Or, more robustly, redefine it.
    // We cannot directly assign to window.location or use spyOn for 'get' easily.
    // We need to mock the reload method.
    
    // Create a new object for location with a mocked reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true, // Allows us to redefine it
      writable: true,     // Allows us to change it
      value: { ...originalLocation, reload: mockReload }, // Spread original properties and override reload
    });
    // --- END CORRECTION ---
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
    });
    jest.restoreAllMocks(); // This will restore other Jest spies, but not the Object.defineProperty change
  });

  it('should display a loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<MenuPage />);
    expect(screen.getByText('Loading delicious menu items...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display menu categories when data is fetched successfully', async () => {
    const mockMenuData: MenuCategory[] = [
      { id: 'cat1', name: 'Appetizers', items: [{id: 'item1', name: 'Spring Rolls', price: 5, description: 'Crispy rolls'}] },
      { id: 'cat2', name: 'Main Courses', items: [{id: 'item2', name: 'Steak', price: 25, description: 'Juicy steak'}] },
    ];
    mockFetch.mockResolvedValue(createMockResponse(true, 200, mockMenuData));

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByTestId('category-cat1')).toBeInTheDocument();
    });
    expect(screen.getByText('Appetizers Section')).toBeInTheDocument();
    expect(screen.getByTestId('category-cat2')).toBeInTheDocument();
    expect(screen.getByText('Main Courses Section')).toBeInTheDocument();
    expect(screen.queryByText('Loading delicious menu items...')).not.toBeInTheDocument();
  });

  it('should display an error message if fetching menu data fails (response not ok)', async () => {
    const errorResponse = { error: 'Server is down' };
    mockFetch.mockResolvedValue(createMockResponse(false, 500, errorResponse, 'Internal Server Error'));

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    });
    expect(screen.getByText(/Error details: Server is down/i)).toBeInTheDocument();
    expect(screen.queryByText('Loading delicious menu items...')).not.toBeInTheDocument();
  });

  it('should display an error message if fetching menu data fails (network error)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    });
    expect(screen.getByText(/Error details: Network error/i)).toBeInTheDocument();
    expect(screen.queryByText('Loading delicious menu items...')).not.toBeInTheDocument();
  });
  
  it('should display "Menu Not Available" if fetched data is empty', async () => {
    mockFetch.mockResolvedValue(createMockResponse(true, 200, []));

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByText('Menu Not Available')).toBeInTheDocument();
    });
    expect(screen.getByText('It seems there are no items on the menu right now. Please check back later!')).toBeInTheDocument();
    expect(screen.queryByText('Loading delicious menu items...')).not.toBeInTheDocument();
  });

  it('should call window.location.reload when "Try Again" button is clicked after an error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(tryAgainButton);

    // Now `window.location.reload` is the jest.fn() we defined in beforeEach
    expect(window.location.reload).toHaveBeenCalledTimes(1); 
  });

  it('should attempt to parse error details from JSON response', async () => {
    const errorJson = { details: "Specific error from API" };
    mockFetch.mockResolvedValue(createMockResponse(false, 400, errorJson, 'Bad Request'));

    render(<MenuPage />);
    await waitFor(() => {
        expect(screen.getByText(/Error details: Specific error from API/i)).toBeInTheDocument();
    });
  });

  it('should use statusText if JSON parsing of error response fails', async () => {
    const mockBadJsonResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => { throw new Error("Malformed JSON"); },
        text: async () => "Service Unavailable",
    };
    mockFetch.mockResolvedValue(mockBadJsonResponse);

    render(<MenuPage />);
    await waitFor(() => {
        expect(screen.getByText(/Error details: Failed to fetch menu: Service Unavailable/i)).toBeInTheDocument();
    });
  });
});