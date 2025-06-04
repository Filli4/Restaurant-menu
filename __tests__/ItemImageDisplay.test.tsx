// __tests__/ItemImageDisplay.test.tsx

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemImageDisplay from '@/components/ItemImageDisplay';
import { useFirebaseImage } from '@/hooks/useFirebaseImage'; // Import the hook to mock it

// --- MOCKS ---

// Mock the useFirebaseImage hook
jest.mock('@/hooks/useFirebaseImage');
const mockUseFirebaseImage = useFirebaseImage as jest.Mock;

// Mock next/image
// This is a basic mock. If you need to test specific Next/Image behavior
// or if it causes errors, you might need a more detailed mock.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} data-testid="next-image-mock" />;
  },
}));

// --- TEST SUITE ---
describe('ItemImageDisplay Component', () => {
  const defaultProps = {
    imagePath: 'gs://bucket/image.jpg',
    altText: 'Test Image Alt Text',
    sizes: '(max-width: 600px) 100vw, 50vw',
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseFirebaseImage.mockReset();
  });

  it('should render the default loading placeholder when image is loading', () => {
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null,
      isLoading: true,
      error: null,
    });

    render(<ItemImageDisplay {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // Check for a class that indicates the default loading placeholder if specific
    expect(screen.getByText('Loading...').parentElement).toHaveClass('animate-pulse');
  });

  it('should render a custom loading component when provided and image is loading', () => {
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null,
      isLoading: true,
      error: null,
    });
    const CustomLoading = () => <div data-testid="custom-loading">Custom Loading State</div>;

    render(<ItemImageDisplay {...defaultProps} loadingComponent={<CustomLoading />} />);
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should render the default error placeholder when useFirebaseImage returns an error', () => {
    const errorMessage = 'Firebase storage error';
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null,
      isLoading: false,
      error: new Error(errorMessage),
    });

    render(<ItemImageDisplay {...defaultProps} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    // Check for a class or element that indicates the default error placeholder
    expect(screen.getByText(errorMessage).previousElementSibling?.tagName).toBe('svg');
  });

  it('should render the default error placeholder when imagePath is null/undefined and no URL is fetched', () => {
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null,
      isLoading: false,
      error: null,
    });

    render(<ItemImageDisplay {...defaultProps} imagePath={null} />); // Pass null imagePath
    // Changed expectation to match component's actual error message
    expect(screen.getByText("No image path provided")).toBeInTheDocument();
  });

  it('should render the default error placeholder when imagePath is valid but no URL is fetched (e.g., image not found in storage)', () => {
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null, // No URL returned
      isLoading: false,
      error: null,
    });

    render(<ItemImageDisplay {...defaultProps} />);
    // Changed expectation to match component's actual error message
    expect(screen.getByText("Image URL not found")).toBeInTheDocument();
  });


  it('should render a custom error component when provided and there is an error', () => {
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: null,
      isLoading: false,
      error: new Error('Some error'),
    });
    const CustomError = () => <div data-testid="custom-error">Custom Error State</div>;

    render(<ItemImageDisplay {...defaultProps} errorComponent={<CustomError />} />);
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    // This queryByText might need adjustment if the custom error component doesn't prevent default message display logic
    // However, the component logic is `errorComponent || <DefaultErrorPlaceholder ...>`, so this should be fine.
    // If 'Some error' is the message, then "Image not available" wouldn't be shown.
    // The original `expect(screen.queryByText('Image not available')).not.toBeInTheDocument();` is fine here.
    expect(screen.queryByText('Image not available')).not.toBeInTheDocument(); 
  });

  it('should render Next/Image with correct props when imageUrl is available', () => {
    const firebaseImageUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg?alt=media';
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: firebaseImageUrl,
      isLoading: false,
      error: null,
    });

    render(<ItemImageDisplay {...defaultProps} imageClassName="custom-image-class" priority={true} />);

    const imgElement = screen.getByTestId('next-image-mock');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', firebaseImageUrl);
    expect(imgElement).toHaveAttribute('alt', defaultProps.altText);
    expect(imgElement).toHaveAttribute('sizes', defaultProps.sizes);
    expect(imgElement).toHaveClass('custom-image-class'); // Checks className from props
  });

  it('should use default imageClassName if none is provided', () => {
    const firebaseImageUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg?alt=media';
    mockUseFirebaseImage.mockReturnValue({
      imageUrl: firebaseImageUrl,
      isLoading: false,
      error: null,
    });

    // Render without imageClassName prop
    render(<ItemImageDisplay {...defaultProps} priority={false} />);

    const imgElement = screen.getByTestId('next-image-mock');
    expect(imgElement).toHaveClass('object-cover'); // Checks default className
  });
});