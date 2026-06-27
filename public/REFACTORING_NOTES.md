# Frontend Refactoring: Modular Architecture

## Overview
The monolithic `app.js` has been refactored into a modular, maintainable structure. Each concern is now separated into its own file for better code organization and easier maintenance.

## File Structure

```
public/
├── index.html              # Main HTML entry point (updated with script loading order)
├── styles.css              # Styles
├── utils.js                # Utility functions (initials, titleCase, distanceKm, etc.)
├── constants.js            # Application constants (API_URL, fallbackImages, locations, etc.)
├── services.js             # API service layer (handles all backend communication)
├── App.js                  # Main app component with state management
├── components/
│   ├── Field.js            # Form field component
│   ├── Tab.js              # Navigation tab component
│   ├── Stat.js             # Statistics display component
│   ├── ProductCard.js      # Product card component
│   ├── LineItem.js         # Cart line item component
│   ├── Topbar.js           # Main navigation header
│   ├── AuthPanel.js        # Login/register panel
│   ├── ShopView.js         # Shopping interface
│   ├── CartView.js         # Shopping cart interface
│   ├── MerchantView.js     # Merchant product management
│   ├── OrdersView.js       # Order history
│   ├── MapView.js          # Restaurant map interface
│   └── AdminView.js        # Admin dashboard
```

## Module Descriptions

### Core Files

**utils.js**
- `initials()` - Extract initials from name
- `titleCase()` - Convert strings to title case
- `distanceKm()` - Calculate distance between coordinates
- `degreesToRadians()` - Convert degrees to radians
- `escapeHtml()` - Sanitize HTML strings
- `money()` - Format currency values

**constants.js**
- `API` - API base URL
- `fallbackImages` - Array of fallback product images
- `addisCenter` - Default map center coordinates
- `fallbackRestaurants` - Default restaurant locations

**services.js**
- `ApiService` class - Encapsulates all API communication
- Methods: `login()`, `register()`, `getProducts()`, `createProduct()`, `deleteProduct()`, `getCart()`, `addToCart()`, `updateCartItem()`, `removeFromCart()`, `getOrders()`, `placeOrder()`, `getDashboard()`
- Global `apiService` instance for use throughout the app

**App.js**
- Main `App` component
- State management (session, view, products, cart, orders, stats, etc.)
- Business logic handlers (login, logout, addToCart, placeOrder, etc.)
- Renders appropriate view based on current state

### Component Files

**Small Reusable Components:**
- `Field.js` - Form input field wrapper
- `Tab.js` - Navigation tab button
- `Stat.js` - Statistic display card
- `ProductCard.js` - Product display card
- `LineItem.js` - Cart item row

**View Components:**
- `Topbar.js` - Header with navigation and user account
- `AuthPanel.js` - Login and registration panel
- `ShopView.js` - Main shopping interface
- `CartView.js` - Shopping cart with checkout
- `MerchantView.js` - Product management for merchants
- `OrdersView.js` - Order history display
- `MapView.js` - Interactive restaurant map
- `AdminView.js` - Admin statistics dashboard

## Benefits

1. **Better Organization** - Each file has a single responsibility
2. **Easier Maintenance** - Find and modify features in dedicated files
3. **Reusability** - Components can be easily reused or modified independently
4. **Scalability** - Easier to add new features or components
5. **Cleaner Code** - Reduced file sizes make code more readable
6. **Separation of Concerns** - UI, logic, utilities, and constants are separate

## Script Loading Order (index.html)

The scripts are loaded in this specific order to ensure dependencies are available:

1. React & React-DOM
2. Leaflet (for maps)
3. **Utilities** (utils.js) - Used by many components
4. **Constants** (constants.js) - Used by many components
5. **Services** (services.js) - Used by App component
6. **Reusable Components** (Field, Tab, Stat, ProductCard, LineItem) - Used by view components
7. **View Components** (Topbar, AuthPanel, ShopView, etc.) - Used by App
8. **Main App** (App.js) - Renders the entire application

## Development Tips

- To add a new feature, create a new component file in `/components/`
- To add a new API endpoint, add a method to the `ApiService` class in `services.js`
- To add a new utility function, add it to `utils.js`
- To add new constants, add them to `constants.js`
- Always import needed functions at the top of each file using comments (since we're not using ES modules)

## Future Improvements

- Consider migrating to ES6 modules for better encapsulation
- Add unit tests for utility functions and API service
- Implement error boundaries for better error handling
- Add loading states and skeleton screens
- Consider a state management library (Redux, Zustand) for complex state
