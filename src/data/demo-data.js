// Demo data - Sample customers, products, and orders for demonstration

const FIRST_ORDER_TIME_OFFSET = 100000;
const SECOND_ORDER_TIME_OFFSET = 50000;

export const demoData = {
  customers: [
    { id: 0, name: 'Guest', phone: '', email: '' },
    { id: 2, name: 'Alice Demo', phone: '0711234567', email: 'alice@test.com' },
    { id: 3, name: 'Bob Demo', phone: '0729876543', email: 'bob@test.com' },
    { id: 4, name: 'Charlie Demo', phone: '0735556789', email: '' },
    { id: 5, name: 'Diana Demo', phone: '0744441234', email: '' },
    { id: 6, name: 'Ethan Demo', phone: '0753335678', email: '' },
    { id: 7, name: 'Fiona Demo', phone: '0762224321', email: '' },
    { id: 8, name: 'George Demo', phone: '0771118765', email: '' },
    { id: 9, name: 'Hannah Demo', phone: '0780003456', email: '' },
    { id: 10, name: 'Ian Demo', phone: '0799996543', email: '' },
    { id: 11, name: 'Jane Demo', phone: '0701237890', email: '' },
  ],

  items: [
    // Beef Burgers
    {
      id: 1,
      name: 'Beef Whopper',
      price: 2050.85,
      category: 'Beef Burgers',
      image: '🍔',
    },
    {
      id: 2,
      name: 'Classic Beef',
      price: 1650.0,
      category: 'Beef Burgers',
      image: '🍔',
    },
    {
      id: 3,
      name: 'Double Beef',
      price: 2450.0,
      category: 'Beef Burgers',
      image: '🍔',
    },
    {
      id: 4,
      name: 'Bacon Beef',
      price: 2250.0,
      category: 'Beef Burgers',
      image: '🥓',
    },

    // Chicken Burgers
    {
      id: 5,
      name: 'Crispy Chicken',
      price: 1850.0,
      category: 'Chicken Burgers',
      image: '🍗',
    },
    {
      id: 6,
      name: 'Spicy Chicken',
      price: 1950.0,
      category: 'Chicken Burgers',
      image: '🌶️',
    },
    {
      id: 7,
      name: 'Grilled Chicken',
      price: 2050.0,
      category: 'Chicken Burgers',
      image: '🍗',
    },

    // Veggie
    {
      id: 8,
      name: 'Veggie Burger',
      price: 913.56,
      category: 'Veggie Burger',
      image: '🥬',
    },
    {
      id: 9,
      name: 'Mushroom Burger',
      price: 1150.0,
      category: 'Veggie Burger',
      image: '🍄',
    },

    // Sides
    {
      id: 10,
      name: 'Thick Cut Fries',
      price: 559.32,
      category: 'Sides',
      image: '🍟',
    },
    {
      id: 11,
      name: 'Onion Rings',
      price: 450.0,
      category: 'Sides',
      image: '🧅',
    },
    {
      id: 12,
      name: 'Cheese Fries',
      price: 650.0,
      category: 'Sides',
      image: '🧀',
    },
    { id: 13, name: 'Coleslaw', price: 350.0, category: 'Sides', image: '🥗' },

    // Beverages
    {
      id: 14,
      name: 'Iced Coffee',
      price: 593.0,
      category: 'Beverages',
      image: '☕',
    },
    {
      id: 15,
      name: 'Coca Cola',
      price: 250.0,
      category: 'Beverages',
      image: '🥤',
    },
    {
      id: 16,
      name: 'Orange Juice',
      price: 350.0,
      category: 'Beverages',
      image: '🍊',
    },
    {
      id: 17,
      name: 'Milkshake',
      price: 550.0,
      category: 'Beverages',
      image: '🥛',
    },

    // Desserts
    {
      id: 18,
      name: 'Chocolate Brownie',
      price: 450.0,
      category: 'Desserts',
      image: '🍫',
    },
    {
      id: 19,
      name: 'Ice Cream Sundae',
      price: 550.0,
      category: 'Desserts',
      image: '🍨',
    },
    {
      id: 20,
      name: 'Apple Pie',
      price: 400.0,
      category: 'Desserts',
      image: '🥧',
    },
  ],

  orders: [
    {
      id: Date.now() - FIRST_ORDER_TIME_OFFSET,
      items: [
        {
          id: 1,
          name: 'Beef Whopper',
          price: 2050.85,
          category: 'Beef Burgers',
          image: '🍔',
          quantity: 2,
        },
        {
          id: 10,
          name: 'Thick Cut Fries',
          price: 559.32,
          category: 'Sides',
          image: '🍟',
          quantity: 1,
        },
      ],
      customer: {
        id: 2,
        name: 'Alice Demo',
        phone: '0711234567',
        email: 'alice@test.com',
      },
      orderType: 'dine-in',
      subtotal: 4661.02,
      discountValue: 0,
      discountType: 'none',
      taxRate: 0,
      taxAmount: 0,
      total: 4661.02,
      amountReceived: 5000,
      changeDue: 338.98,
      paymentMethod: 'cash',
      status: 'completed',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - FIRST_ORDER_TIME_OFFSET).toISOString(),
    },
    {
      id: Date.now() - SECOND_ORDER_TIME_OFFSET,
      items: [
        {
          id: 8,
          name: 'Veggie Burger',
          price: 913.56,
          category: 'Veggie Burger',
          image: '🥬',
          quantity: 1,
        },
        {
          id: 14,
          name: 'Iced Coffee',
          price: 593.0,
          category: 'Beverages',
          image: '☕',
          quantity: 2,
        },
      ],
      customer: {
        id: 3,
        name: 'Bob Demo',
        phone: '0729876543',
        email: 'bob@test.com',
      },
      orderType: 'takeaway',
      subtotal: 2099.56,
      discountValue: 100,
      discountType: 'flat',
      taxRate: 0,
      taxAmount: 0,
      total: 1999.56,
      amountReceived: 2000,
      changeDue: 0.44,
      paymentMethod: 'card',
      status: 'completed',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - SECOND_ORDER_TIME_OFFSET).toISOString(),
    },
  ],
};

export default demoData;
