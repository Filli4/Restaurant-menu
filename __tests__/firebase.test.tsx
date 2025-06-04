// __tests__/firebase.test.ts

// Mock the 'firebase/app', 'firebase/firestore', and 'firebase/storage' modules
// These mocks will be active for any import of these modules.

// Mock constants that will be returned by our mock functions
const MOCK_APP_INSTANCE = { appName: 'test-app' };
const MOCK_DB_INSTANCE = { dbName: 'test-db' };
const MOCK_STORAGE_INSTANCE = { storageName: 'test-storage' };

// Mock implementations for firebase/app
const mockInitializeApp = jest.fn(() => MOCK_APP_INSTANCE);
const mockGetApps = jest.fn(); // We'll control its return value in tests
const mockGetApp = jest.fn(() => MOCK_APP_INSTANCE);

jest.mock('firebase/app', () => ({
  __esModule: true, // if your project uses ES Modules
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

// Mock implementations for firebase/firestore
const mockGetFirestore = jest.fn((app) => MOCK_DB_INSTANCE);
// We don't need to mock `collection` here as it's not called directly by src/lib/firebase.ts top-level code.
// If it were, we'd add it.

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getFirestore: mockGetFirestore,
  // collection: jest.fn(), // Only if needed
}));

// Mock implementations for firebase/storage
const mockGetStorage = jest.fn((app) => MOCK_STORAGE_INSTANCE);

jest.mock('firebase/storage', () => ({
  __esModule: true,
  getStorage: mockGetStorage,
}));


describe('Firebase Initialization (src/lib/firebase.ts)', () => {
  
  beforeEach(() => {
    // Reset all mocks before each test
    mockInitializeApp.mockClear();
    mockGetApps.mockClear();
    mockGetApp.mockClear();
    mockGetFirestore.mockClear();
    mockGetStorage.mockClear();

    // Clear module cache for src/lib/firebase.ts to ensure it re-runs its initialization logic
    // for each test scenario (especially for the getApps().length check).
    jest.resetModules(); 
  });

  it('should initialize a new Firebase app if no apps exist', () => {
    // Arrange: Ensure getApps returns an empty array
    mockGetApps.mockReturnValue([]);

    // Act: Import the module. This will execute its top-level code.
    // We need to dynamically import because its top-level code runs on import.
    // The type assertion is to help TypeScript.
    const firebaseModule = require('@/lib/firebase') as typeof import('@/lib/firebase'); 

    // Assert
    expect(mockGetApps).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    // firebaseConfig is not easily testable here without mocking process.env,
    // but we can check if initializeApp was called with *an* object.
    expect(mockInitializeApp).toHaveBeenCalledWith(expect.any(Object)); 
    expect(mockGetApp).not.toHaveBeenCalled();

    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
    expect(mockGetFirestore).toHaveBeenCalledWith(MOCK_APP_INSTANCE); // The app instance returned by initializeApp
    expect(mockGetStorage).toHaveBeenCalledTimes(1);
    expect(mockGetStorage).toHaveBeenCalledWith(MOCK_APP_INSTANCE);

    // Check exported values
    expect(firebaseModule.app).toBe(MOCK_APP_INSTANCE);
    expect(firebaseModule.db).toBe(MOCK_DB_INSTANCE);
    expect(firebaseModule.storage).toBe(MOCK_STORAGE_INSTANCE);
  });

  it('should use an existing Firebase app if one already exists', () => {
    // Arrange: Ensure getApps returns an array with at least one app
    mockGetApps.mockReturnValue([MOCK_APP_INSTANCE]); // Simulate an existing app

    // Act: Import the module
    const firebaseModule = require('@/lib/firebase') as typeof import('@/lib/firebase');

    // Assert
    expect(mockGetApps).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalledTimes(1);

    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
    expect(mockGetFirestore).toHaveBeenCalledWith(MOCK_APP_INSTANCE); // The app instance returned by getApp
    expect(mockGetStorage).toHaveBeenCalledTimes(1);
    expect(mockGetStorage).toHaveBeenCalledWith(MOCK_APP_INSTANCE);
    
    // Check exported values
    expect(firebaseModule.app).toBe(MOCK_APP_INSTANCE);
    expect(firebaseModule.db).toBe(MOCK_DB_INSTANCE);
    expect(firebaseModule.storage).toBe(MOCK_STORAGE_INSTANCE);
  });

  it('should pass the firebaseConfig to initializeApp', () => {
    // Arrange
    mockGetApps.mockReturnValue([]);
    
    // Mock process.env for this test
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
    };

    // Act
    require('@/lib/firebase'); // Import to trigger initialization

    // Assert
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id',
      storageBucket: 'test-storage-bucket',
      messagingSenderId: 'test-sender-id',
      appId: 'test-app-id',
    });

    // Restore original process.env
    process.env = originalEnv;
  });
});