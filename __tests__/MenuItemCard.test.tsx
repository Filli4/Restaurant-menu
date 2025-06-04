// __tests__/components/MenuItemCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuItemCard from '@/components/menuCards/MenuItemCard';
import { useCartStore, type MenuItem } from '@/store/cartStore';

// --- MOCKS ---
const mockItemImageDisplay = jest.fn<React.ReactNode, [any]>(); // Simplified type

jest.mock('@/components/ItemImageDisplay', () => ({
  __esModule: true,
  default: (props: any) => {
    // Call the mock function with props, and return a placeholder for rendering
    mockItemImageDisplay(props); 
    return <div data-testid="mock-item-image-display">Mocked Image for {props.altText}</div>;
  },
}));
const mockAddItem = jest.fn();

// --- TEST SUITE ---
describe('MenuItemCard Component', () => {
  const mockItem: MenuItem = {
    id: 'item123',
    name: 'Spicy Burger',
    description: 'A delicious and spicy burger with all the fixings.',
    price: 12.99,
    imageUrl: '/images/spicy-burger.jpg', // Should be a gs:// path if ItemImageDisplay expects it, or a regular URL if useFirebaseImage handles it
  };

  beforeEach(() => {
    mockItemImageDisplay.mockClear();
    mockAddItem.mockClear();
    useCartStore.setState({ addItem: mockAddItem });
  });

  it('should render item details correctly', () => {
    render(<MenuItemCard item={mockItem} categoryId="cat1" itemIndexInCategory={0} />);
    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    expect(screen.getByText(`$${mockItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Add ${mockItem.name} to cart` })).toBeInTheDocument();
  });

  it('should render ItemImageDisplay with correct props (default priority false)', () => {
    // Test case where priority should be false (e.g., not in "Appetizers" or not first few)
    render(<MenuItemCard item={mockItem} categoryId="MainDishes" itemIndexInCategory={0} />);
    expect(mockItemImageDisplay).toHaveBeenCalledTimes(1);
    expect(mockItemImageDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        imagePath: mockItem.imageUrl,
        altText: mockItem.name,
        sizes: "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 22vw",
        imageClassName: "w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110",
        priority: false, // Explicitly false due to categoryId !== "Appetizers"
      })
    );
    expect(screen.getByTestId('mock-item-image-display')).toBeInTheDocument();
  });

  it('should call addToCart with the item when "Add" button is clicked', () => {
    render(<MenuItemCard item={mockItem} categoryId="cat1" itemIndexInCategory={0} />);
    const addButton = screen.getByRole('button', { name: `Add ${mockItem.name} to cart` });
    fireEvent.click(addButton);
    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith(mockItem);
  });

  // Corrected test for priority: true
  it('should set priority to true for ItemImageDisplay if item is one of the first two in "Appetizers" category', () => {
    const priorityTestItem: MenuItem = { ...mockItem, id: 'appetizer001', name: 'Priority Appetizer' };
    render(
      <MenuItemCard 
        item={priorityTestItem} 
        categoryId="Appetizers"      // Meets first condition for priority
        itemIndexInCategory={0}     // Meets second condition for priority (e.g., 0 or 1)
      />
    );
    expect(mockItemImageDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        imagePath: priorityTestItem.imageUrl,
        altText: priorityTestItem.name,
        sizes: "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 22vw",
        imageClassName: "w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110",
        priority: true, // Expect priority to be true based on categoryId and itemIndexInCategory
      })
    );
  });

  // Updated this test to be more explicit about why priority is false.
  it('should set priority to false if item is in "Appetizers" but not one of the first two', () => {
    const nonPriorityAppetizer: MenuItem = { ...mockItem, id: 'appetizer003', name: 'Later Appetizer' };
    render(
        <MenuItemCard 
            item={nonPriorityAppetizer} 
            categoryId="Appetizers"      // Meets first condition
            itemIndexInCategory={2}     // Does NOT meet second condition (index is 2, not < 2)
        />
    );
    expect(mockItemImageDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        imagePath: nonPriorityAppetizer.imageUrl,
        altText: nonPriorityAppetizer.name,
        sizes: "(max-width: 639px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 22vw",
        imageClassName: "w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110",
        priority: false, // Expect priority to be false
      })
    );
  });

  // This test remains valid: if categoryId and itemIndexInCategory are not provided (or don't meet criteria), priority is false.
  // Renamed for clarity.
  it('should set priority to false by default if category/index criteria not met', () => {
    const defaultPriorityItem: MenuItem = { ...mockItem, id: 'someItem' }; 
    // Render without categoryId and itemIndexInCategory, or with values that don't trigger priority
    render(<MenuItemCard item={defaultPriorityItem} categoryId="SomeOtherCategory" itemIndexInCategory={5}/>); 
    expect(mockItemImageDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: false, 
      })
    );
  });
});