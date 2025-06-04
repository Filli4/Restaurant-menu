// __tests__/cart.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from '@/components/Cart'; // This will import src/lib/firebase.ts
import { useCartStore, type CartItem as ZustandCartItem } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

// --- MOCKS ---

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockRouterPush = jest.fn();

jest.mock('@/store/cartStore');
const mockUseCartStore = useCartStore as unknown as jest.Mock;

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ appName: 'mocked-app-instance' })), // Return a simple identifiable object
  getApps: jest.fn(() => []), 
  getApp: jest.fn(() => ({ appName: 'mocked-app-instance' })),    // Can return the same object
}));

// Mock firebase/firestore
const MOCK_FS_COLLECTION_REF = { ref: 'mock-firestore-collection-ref' };
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn((app) => ({ firestoreName: 'mocked-db-instance' })), // Return simple object
  collection: jest.fn((dbParam, path) => MOCK_FS_COLLECTION_REF),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
}));

// Mock firebase/storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn((app) => ({ storageName: 'mocked-storage-instance' })), // Return simple object
  // Add other storage functions (ref, uploadBytes etc.) as jest.fn() if needed by any code path
}));

jest.mock('@/components/ItemImageDisplay', () => ({
  __esModule: true,
  default: ({ altText }: { altText: string }) => <div data-testid={`mock-img-${altText}`}>{altText} Image</div>,
}));

// Get references to the mock functions AFTER jest.mock has established them.
const { initializeApp: mockedInitializeApp, getApps: mockedGetApps, getApp: mockedGetApp } = 
  jest.requireMock('firebase/app') as { initializeApp: jest.Mock, getApps: jest.Mock, getApp: jest.Mock };

const { getFirestore: mockedGetFirestore, collection: mockedFsCollection, addDoc: mockedFsAddDoc, serverTimestamp: mockedFsServerTimestamp } = 
  jest.requireMock('firebase/firestore') as { getFirestore: jest.Mock, collection: jest.Mock, addDoc: jest.Mock, serverTimestamp: jest.Mock };

const { getStorage: mockedGetStorage } =
  jest.requireMock('firebase/storage') as { getStorage: jest.Mock };


const setupMockStore = (
  initialItems: ZustandCartItem[] = [],
  initialTotalPrice: number = 0,
  initialTotalItems: number = 0,
  initialIsCartPanelOpen: boolean = false
) => {
  const mockState = {
    items: initialItems,
    isCartPanelOpen: initialIsCartPanelOpen,
    getTotalPrice: jest.fn(() => initialTotalPrice),
    getTotalItems: jest.fn(() => initialTotalItems),
    removeItem: jest.fn(),
    incrementQuantity: jest.fn(),
    decrementQuantity: jest.fn(),
    clearCart: jest.fn(),
    toggleCartPanel: jest.fn(),
  };
  mockUseCartStore.mockImplementation((selector: any) => selector(mockState));
  return mockState;
};

describe('Cart Component', () => {
  let mockStore: ReturnType<typeof setupMockStore>;
  let useStateSpy: jest.SpyInstance;

  const mockUseStateSequence = (states: Array<[any, jest.Mock]>) => {
    useStateSpy = jest.spyOn(React, 'useState');
    states.forEach(([initialValue, setStateFn]) => {
      useStateSpy.mockImplementationOnce(() => [initialValue, setStateFn]);
    });
    useStateSpy.mockImplementation((initial) => [initial, jest.fn()]);
  };

  beforeEach(() => {
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    mockRouterPush.mockClear();

    mockedInitializeApp.mockClear();
    mockedGetApps.mockClear().mockReturnValue([]); // Critical: reset for each test
    mockedGetApp.mockClear();

    mockedGetFirestore.mockClear();
    mockedFsCollection.mockClear();
    mockedFsAddDoc.mockClear();
    mockedFsServerTimestamp.mockClear();

    mockedGetStorage.mockClear(); // Clear storage mock

    mockStore = setupMockStore([], 0, 0, false);

    if (useStateSpy) {
      useStateSpy.mockRestore();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render a hidden panel before mount', () => {
    const mockSetHasMounted = jest.fn();
    const mockSetIsOrdering = jest.fn();
    const mockSetOrderFeedback = jest.fn();
    mockUseStateSequence([
        [false, mockSetHasMounted],
        [false, mockSetIsOrdering],
        [null, mockSetOrderFeedback],
    ]);
    const { container } = render(<Cart />);
    const panelDiv = container.firstChild as HTMLElement;
    expect(panelDiv).toHaveClass('transform', 'translate-x-full');
    expect(screen.queryByText('Your cart is empty.')).not.toBeInTheDocument();
  });

  describe('After Mount (hasMounted = true)', () => {
    const mockSetHasMounted = jest.fn();
    const mockSetIsOrdering = jest.fn();
    const mockSetOrderFeedback = jest.fn();

    beforeEach(() => {
        if (useStateSpy) {
            useStateSpy.mockRestore();
        }
        mockUseStateSequence([
            [true, mockSetHasMounted],
            [false, mockSetIsOrdering],
            [null, mockSetOrderFeedback],
        ]);
    });

    it('should display "Your cart is empty." when panel is open and cart has no items', () => {
      mockStore = setupMockStore([], 0, 0, true); 
      render(<Cart />);
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    it('should NOT display "Your cart is empty." when panel is closed, even if cart is empty', () => {
      render(<Cart />);
      expect(screen.queryByText('Your cart is empty.')).not.toBeInTheDocument();
    });

    it('should display cart items, total, and checkout button when panel is open and cart has items', () => {
      const items: ZustandCartItem[] = [
        { id: '1', name: 'Burger', price: 10, quantity: 2, imageUrl: 'burger.jpg', description: '' },
        { id: '2', name: 'Fries', price: 5, quantity: 1, imageUrl: 'fries.jpg', description: '' },
      ];
      mockStore = setupMockStore(items, 25, 3, true); 
      render(<Cart />);
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
      expect(screen.getByText('$5.00')).toBeInTheDocument();
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Checkout' })).toBeInTheDocument();
    });

    it('should call toggleCartPanel when the close (X) button is clicked', () => {
      mockStore = setupMockStore([], 0, 0, true); 
      render(<Cart />);
      fireEvent.click(screen.getByLabelText('Close cart'));
      expect(mockStore.toggleCartPanel).toHaveBeenCalledTimes(1);
    });
    
    it('should call incrementQuantity when plus button is clicked (panel open)', () => {
      const items: ZustandCartItem[] = [{ id: '1', name: 'Burger', price: 10, quantity: 1, imageUrl: 'burger.jpg', description: '' }];
      mockStore = setupMockStore(items, 10, 1, true);
      render(<Cart />);
      fireEvent.click(screen.getByLabelText('Increase quantity of Burger'));
      expect(mockStore.incrementQuantity).toHaveBeenCalledWith('1');
    });

    it('should call decrementQuantity when minus button is clicked (panel open)', () => {
      const items: ZustandCartItem[] = [{ id: '1', name: 'Burger', price: 10, quantity: 2, imageUrl: 'burger.jpg', description: '' }];
      mockStore = setupMockStore(items, 20, 2, true);
      render(<Cart />);
      fireEvent.click(screen.getByLabelText('Decrease quantity of Burger'));
      expect(mockStore.decrementQuantity).toHaveBeenCalledWith('1');
    });

    it('should call removeItem when remove button is clicked (panel open)', () => {
      const items: ZustandCartItem[] = [{ id: '1', name: 'Burger', price: 10, quantity: 1, imageUrl: 'burger.jpg', description: '' }];
      mockStore = setupMockStore(items, 10, 1, true);
      render(<Cart />);
      fireEvent.click(screen.getByLabelText('Remove all Burger from cart'));
      expect(mockStore.removeItem).toHaveBeenCalledWith('1');
    });

    

    it('should display error message if checkout fails (panel open)', async () => {
        const items: ZustandCartItem[] = [{ id: '1', name: 'Burger', price: 10, quantity: 1, imageUrl: 'burger.jpg', description: '' }];
        mockStore = setupMockStore(items, 10, 1, true);
        const firebaseError = new Error("Firebase write failed");
        mockedFsAddDoc.mockRejectedValueOnce(firebaseError);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<Cart />);
        fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));

        await waitFor(() => {
            expect(screen.getByText(/Failed to place order. Details: Firebase write failed/i)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Checkout' })).not.toBeDisabled();
        consoleErrorSpy.mockRestore();
    });
  });
});