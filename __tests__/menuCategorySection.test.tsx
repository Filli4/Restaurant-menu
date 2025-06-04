// __tests__/MenuCategorySection.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuCategorySection from '@/components/menuCards/MenuCategorySection';
import { MenuCategory, MenuItem } from '@/types/menu'; // Adjust path if necessary

// Mock MenuItemCard to prevent testing its internal logic here
// and to easily check if it's called with the correct props.
const mockMenuItemCard = jest.fn();
jest.mock('@/components/menuCards/MenuItemCard', () => ({ // Adjust path if necessary
  __esModule: true,
  default: (props: any) => {
    mockMenuItemCard(props); // Call our mock function with the props
    // Return a simple placeholder for rendering verification
    return <div data-testid={`mock-menu-item-card-${props.item.id}`}>Mocked Item: {props.item.name}</div>;
  },
}));

describe('MenuCategorySection Component', () => {
  const mockAppetizers: MenuItem[] = [
    { id: 'app1', name: 'Spring Rolls', description: 'Crispy rolls', price: 7.99, imageUrl: 'sr.jpg' },
    { id: 'app2', name: 'Edamame', description: 'Steamed soybeans', price: 5.99, imageUrl: 'ed.jpg' },
  ];

  const mockCategoryWithItems: MenuCategory = {
    id: 'cat1',
    name: 'Appetizers',
    items: mockAppetizers,
  };

  const mockCategoryWithoutItems: MenuCategory = {
    id: 'cat2',
    name: 'Beverages',
    items: [],
  };

  beforeEach(() => {
    // Clear mock call history before each test
    mockMenuItemCard.mockClear();
  });

  it('should render the category title correctly', () => {
    render(<MenuCategorySection category={mockCategoryWithItems} />);
    
    // Check for the h2 heading with the category name
    const heading = screen.getByRole('heading', { name: mockCategoryWithItems.name, level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id', `category-title-${mockCategoryWithItems.id}`);
  });

  it('should render MenuItemCard for each item in the category', () => {
    render(<MenuCategorySection category={mockCategoryWithItems} />);

    // Check if MenuItemCard mock was called for each item
    expect(mockMenuItemCard).toHaveBeenCalledTimes(mockCategoryWithItems.items.length);

    // Check if the rendered placeholders for mocked items are present
    mockCategoryWithItems.items.forEach((item, index) => {
      expect(screen.getByText(`Mocked Item: ${item.name}`)).toBeInTheDocument();
      // Optionally, check props passed to MenuItemCard
      expect(mockMenuItemCard).toHaveBeenCalledWith(
        expect.objectContaining({
          item: item,
          itemIndexInCategory: index,
          categoryId: mockCategoryWithItems.id,
        })
      );
    });
  });

  it('should render a "no items" message if the category has no items', () => {
    render(<MenuCategorySection category={mockCategoryWithoutItems} />);

    // Check for the placeholder text
    expect(screen.getByText('No items currently available in this category.')).toBeInTheDocument();
    
    // Ensure MenuItemCard was not called
    expect(mockMenuItemCard).not.toHaveBeenCalled();
  });

  it('should apply correct aria-labelledby to the section', () => {
    render(<MenuCategorySection category={mockCategoryWithItems} />);
    
    const sectionElement = screen.getByRole('region'); // <section> defaults to role 'region' if it has an accessible name
    expect(sectionElement).toHaveAttribute('aria-labelledby', `category-title-${mockCategoryWithItems.id}`);
  });
});