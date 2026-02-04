# AI Collaboration Challenge - Bulk Operations Feature

## Feature Request

Add a bulk operations feature that allows users to select multiple products and perform batch actions (price updates, category changes, deletion) with confirmation dialogs and undo functionality.

## 1. AI Tool Selection

**Which AI tool would you choose and why?**

I would choose **Claude Code** as my preferred choice for the following reasons:

**Claude Code Advantages:**

- **Best of both worlds** - It has powerful reasoning combined with direct IDE integration.
- **Extended context window** - Can ingest the entire codebase, dependencies, and documentation in a single conversation.
- **Real-time code execution** - Can run terminal commands, execute tests, and verify changes immediately.
- **Strong TypeScript/React expertise** - Excellent at understanding Next.js App Router patterns, React hooks, and TypeScript type safety.
- **Iterative refinement** - Maintains conversation context well for multi-step implementations with testing and debugging.
- **Code quality focus** - Produces well-structured, maintainable code with proper error handling and accessibility considerations.
- **Seamless workflow** - Can implement, test, debug, and refine code without leaving the development environment

**Why Claude Code over alternatives:**

- **vs. Claude Web:** Direct file access and terminal integration eliminate manual copy-paste steps
- **vs. GitHub Copilot:** Larger context window and better reasoning for complex architectural decisions
- **vs. Cursor:** Claude's superior understanding of requirements and ability to maintain long-term context

**Decision:** Claude Code for the entire implementation workflow - from architecture planning through testing and documentation.

---

## 2. Comprehensive Prompt

**Write your complete prompt including context about the codebase architecture and any constraints:**

---

<ROLE>
You are an expert senior full-stack developer specializing in TypeScript, React, Next.js, and accessible web applications. You have 10+ years of experience building production-grade inventory management systems and excel at writing clean, maintainable, well-tested code.
</ROLE>

<TASK>
Implement a comprehensive bulk operations feature for a product inventory management system. This feature must allow users to select multiple products and perform batch actions (price updates, category changes, deletion) with confirmation dialogs and undo functionality.

**Output Format:** Provide complete, production-ready TypeScript/React code files with JSDoc comments, organized by deliverable section.

**Target Audience:** This code will be reviewed by senior engineers and must meet enterprise-grade quality standards.

**Success Metrics:**

- All TypeScript type checks pass (`npm run type-check`)
- All tests pass with >80% coverage (`npm test`)
- All ESLint rules pass (`npm run lint`)
- WCAG AA accessibility compliance
- Zero runtime errors or console warnings
  </TASK>

---

<CODEBASE_CONTEXT>

## Tech Stack

- **Framework:** Next.js 15.4.6 (App Router pattern)
- **Language:** TypeScript 5.7.2 (strict mode enabled)
- **UI Library:** React 18.3.0 with hooks
- **Styling:** TailwindCSS 3.4.17
- **Form Management:** React Hook Form 7.53.2 + Zod 3.24.1 validation
- **Testing:** Jest 29.7.0 + React Testing Library
- **API:** Mock API with 300-800ms simulated delays

## Current Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with global styles
│   ├── page.tsx            # Home: product list + filters (useState management)
│   └── products/page.tsx   # Product creation form (React Hook Form + Zod)
├── components/
│   ├── ProductCard.tsx     # Individual product card with image, price, stock
│   ├── ProductFilters.tsx  # Category, price range, stock filters
│   └── ui/
│       ├── Button.tsx      # Variants: primary, outline, danger
│       └── LoadingSpinner.tsx
├── lib/
│   └── api.ts             # Mock API: getProducts, createProduct, updateProduct, deleteProduct
├── types/
│   ├── product.ts         # Product, FilterOptions, CreateProductRequest, UpdateProductRequest
│   └── api.ts             # ApiResponse<T> generic type
├── data/
│   └── mockProducts.ts    # Array of 20+ mock products
└── utils/
    └── formatters.ts      # Currency, date formatting utilities
```

## Key Type Definitions

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl?: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export type ProductCategory =
  | "Electronics"
  | "Clothing"
  | "Books"
  | "Home & Garden"
  | "Sports"
  | "Toys"
  | "Beauty"
  | "Automotive";
```

## Existing API Functions

```typescript
// All return Promises with simulated delays
getProducts(filters?: FilterOptions): Promise<Product[]>
updateProduct(data: UpdateProductRequest): Promise<ApiResponse<Product>>
deleteProduct(id: string): Promise<ApiResponse<void>>
```

## Current State Management

- **Products:** Fetched once on mount, stored in `useState<Product[]>` in `page.tsx`
- **Filters:** Managed via `useState<FilterOptions>` in `page.tsx`
- **No global state:** No Context, Redux, or Zustand currently used

</CODEBASE_CONTEXT>

---

<DESIGN_SYSTEM>

## Color Palette (TailwindCSS)

- **Primary:** `primary-500`, `primary-600`, `primary-700`
- **Error/Danger:** `error-500`, `error-600`, `error-700`
- **Success:** `success-500`, `success-600`, `success-700`
- **Warning:** `warning-500`, `warning-600`, `warning-700`
- **Neutral:** `gray-100` through `gray-900`

## Component Patterns

**Button Component API:**

```tsx
<Button
  variant="primary" | "outline" | "danger"
  size="sm" | "md" | "lg"
  loading={boolean}
  disabled={boolean}
>
  Button Text
</Button>
```

**Styling Conventions:**

- Rounded corners: `rounded-md` (6px) or `rounded-lg` (8px)
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`
- Spacing: Use Tailwind's 4px scale (p-4, mb-6, etc.)
- Responsive: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

</DESIGN_SYSTEM>

---

<REQUIREMENTS>

## 1. Selection Mechanism

**Action:** Implement a multi-select system for products.

**Specifications:**

- Add a checkbox to the **top-left corner** of each `ProductCard` component
- Add a "Select All" checkbox in the **page header** (above the product grid) that:
  - Selects **all currently visible/filtered products** (not all products in the database)
  - Shows **indeterminate state** (`-` icon) when 1-99% of products are selected
  - Shows **checked state** when 100% of products are selected
  - Shows **unchecked state** when 0% of products are selected
- Display selection count as: **"X of Y products selected"** below the "Select All" checkbox
- **Preserve selections** when filters change, but automatically deselect products that are filtered out

**Example Behavior:**

```
Initial state: 20 products visible, 0 selected
User clicks "Select All" → 20 products selected
User filters by "Electronics" → 5 products visible, 3 selected (if 3 were Electronics)
User unchecks one product → "Select All" shows indeterminate state
```

## 2. Bulk Actions Toolbar

**Action:** Create a sticky toolbar that appears when products are selected.

**Specifications:**

- Position: **Fixed to bottom of viewport** with `fixed bottom-0 left-0 right-0`
- Background: `bg-white` with `shadow-lg` and `border-t border-gray-200`
- Height: **72px** on desktop, **auto** on mobile (stacked buttons)
- Padding: `px-6 py-4`
- **Only visible when** `selectedProducts.length > 0`
- Animate in/out with slide-up transition (200ms ease-out)

**Include exactly 4 action buttons (left to right):**

1. **"Update Prices"** - Primary variant, opens price update modal
2. **"Change Category"** - Primary variant, opens category change modal
3. **"Delete Selected"** - Danger variant, opens delete confirmation modal
4. **"Clear Selection"** - Outline variant, deselects all products

**Accessibility:**

- Toolbar must have `role="toolbar"` and `aria-label="Bulk actions toolbar"`
- Keyboard navigation: Tab through buttons, Enter to activate, Escape to close toolbar
- Focus trap: When toolbar appears, focus first button

## 3. Confirmation Dialogs

**Action:** Create modal dialogs for each bulk action to prevent accidental operations.

**Specifications:**

- Modal backdrop: `fixed inset-0 bg-black bg-opacity-50 z-40`
- Modal container: `fixed inset-0 flex items-center justify-center z-50`
- Modal content: `bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6`
- **All modals must include:**
  - Heading with action name (e.g., "Update Prices for 5 Products")
  - Number of products affected (e.g., "This will update 5 products")
  - Preview of changes (see specific requirements below)
  - Two buttons: "Cancel" (outline) and "Confirm" (primary or danger)
- **Delete modal special requirement:** User must type "DELETE" (case-sensitive) in an input field to enable the Confirm button

**Accessibility:**

- Focus trap: Tab cycles through modal elements only
- Escape key: Closes modal and returns focus to trigger button
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to heading

## 4. Bulk Price Update Modal

**Action:** Allow users to update prices via percentage adjustment or fixed price.

**Specifications:**

- Include **radio buttons** to select mode:
  - Option 1: "Adjust by percentage" (default selected)
  - Option 2: "Set fixed price"
- **Percentage mode:**
  - Input field: Number input with `%` suffix
  - Validation: -100 to +1000 (Zod schema)
  - Example: "+15" increases prices by 15%, "-20" decreases by 20%
- **Fixed price mode:**
  - Input field: Number input with `$` prefix
  - Validation: 0.01 to 999,999.99 (Zod schema)
  - Example: "49.99" sets all selected products to $49.99
- **Preview section:**
  - Show **first 3 products** with before/after prices
  - Format: "Product Name: $X.XX → $Y.YY"
  - If more than 3 products: "...and 2 more products"

**Example Preview:**

```
Wireless Mouse: $29.99 → $34.49 (+15%)
USB Cable: $9.99 → $11.49 (+15%)
Keyboard: $79.99 → $91.99 (+15%)
...and 2 more products
```

## 5. Bulk Category Change Modal

**Action:** Allow users to change the category for all selected products.

**Specifications:**

- Include a **dropdown select** with all 8 categories:
  - Electronics, Clothing, Books, Home & Garden, Sports, Toys, Beauty, Automotive
- Default selection: First category alphabetically ("Automotive")
- **Preview section:**
  - Show count: "This will change 5 products to Electronics"
  - List **first 3 product names**
  - If more than 3: "...and 2 more products"

## 6. Bulk Delete Confirmation Modal

**Action:** Allow users to delete multiple products with strong confirmation.

**Specifications:**

- Heading: "Delete X Products?" (use danger color `text-error-700`)
- Warning message: "This action cannot be undone. All selected products will be permanently deleted."
- **Safety mechanism:**
  - Text input field with placeholder: "Type DELETE to confirm"
  - Confirm button is **disabled** until input exactly matches "DELETE" (case-sensitive)
  - Input validation: Real-time check, no form submission needed
- **Preview section:**
  - List **first 5 product names** to be deleted
  - If more than 5: "...and X more products"

## 7. Undo Functionality

**Action:** Implement single-level undo for the last bulk operation.

**Specifications:**

- After successful bulk operation, show a **toast notification** with:
  - Success message: "Successfully updated 5 products"
  - "Undo" button (outline variant, small size)
  - Auto-dismiss after **exactly 5 seconds**
- Toast position: **Top-right corner** of viewport (`fixed top-4 right-4`)
- Toast styling: `bg-success-100 border border-success-500 text-success-900 rounded-lg shadow-lg p-4`
- **Undo behavior:**
  - Clicking "Undo" reverts all changes from the last operation
  - Show loading state during undo operation
  - After undo completes, show new toast: "Changes reverted"
  - Only store **last operation** (no redo stack)
- **What to store for undo:**
  - Operation type (price update, category change, delete)
  - Array of original product states (before changes)
  - Product IDs affected

**Example Toast:**

```
✓ Successfully updated 5 products  [Undo]
```

## 8. Error Handling

**Action:** Handle partial failures and network errors gracefully.

**Specifications:**

- **Partial failure scenario:** If 3 of 5 products update successfully:
  - Show warning toast: "Updated 3 of 5 products. 2 failed."
  - Include "View Details" button that opens a modal listing:
    - ✓ Product Name (success)
    - ✗ Product Name: Error message (failure)
  - Include "Retry Failed" button to retry only failed operations
  - **Do not clear selection** - keep failed products selected for retry
- **Complete failure scenario:** If all operations fail:
  - Show error toast: "Failed to update products. Please try again."
  - Include "Retry" button
  - Keep all products selected
- **Network error scenario:**
  - Show error toast: "Network error. Please check your connection."
  - Keep all products selected

## 9. Accessibility Requirements

**Action:** Ensure full keyboard navigation and screen reader support.

**Specifications:**

- **Checkboxes:**
  - Each checkbox must have `aria-label="Select [Product Name]"`
  - "Select All" checkbox must have `aria-label="Select all products"`
  - Indeterminate state must have `aria-checked="mixed"`
- **Modals:**
  - Focus trap implemented (Tab cycles within modal)
  - Escape key closes modal
  - Focus returns to trigger button on close
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby` attributes
- **Toolbar:**
  - `role="toolbar"`, `aria-label="Bulk actions toolbar"`
  - Keyboard navigation: Tab, Shift+Tab, Enter, Escape
- **Screen reader announcements:**
  - When selection changes: "5 products selected"
  - When operation completes: "Successfully updated 5 products"
  - Use `aria-live="polite"` regions for announcements
- **Color contrast:** All text must meet WCAG AA standards (4.5:1 for normal text)

## 10. Performance Optimization

**Action:** Prevent unnecessary re-renders and optimize rendering performance.

**Specifications:**

- Wrap `ProductCard` in `React.memo` with custom comparison function
- Use `useCallback` for all event handlers passed as props
- Use `useMemo` for derived state (e.g., selected product IDs)
- Debounce selection changes by **150ms** to batch state updates
- **Batch API calls:** When updating multiple products, call `updateProduct` for each but show single loading state
- Show loading spinner overlay during bulk operations
- Disable all UI interactions while operation is in progress

</REQUIREMENTS>

---

<CONSTRAINTS>

**You MUST follow these constraints strictly:**

1. ❌ **Do NOT modify** `src/lib/api.ts` - use existing API functions as-is
2. ❌ **Do NOT install** new npm packages - use only existing dependencies
3. ❌ **Do NOT use** Redux, Zustand, or other state management libraries
4. ✅ **DO use** React Context if needed to avoid prop drilling
5. ✅ **DO maintain** backward compatibility - existing features must work unchanged
6. ✅ **DO follow** existing code patterns and naming conventions
7. ✅ **DO use** TypeScript strict mode - no `any` types allowed
8. ✅ **DO write** Jest tests for all new hooks and utility functions
9. ✅ **DO add** JSDoc comments to all exported functions and types

</CONSTRAINTS>

---

<DELIVERABLES>

**Provide the following files in this exact order:**

### Step 1: Type Definitions

**File:** `src/types/bulk-operations.ts`

- `BulkAction` type: `'price-update' | 'category-change' | 'delete'`
- `BulkOperationState` interface with selection state
- `UndoOperation` interface with operation history
- `PriceUpdateMode` type: `'percentage' | 'fixed'`

### Step 2: Custom Hook

**File:** `src/hooks/useBulkOperations.ts`

- Selection management (add, remove, toggle, clear, select all)
- Bulk operation execution with error handling
- Undo functionality with state restoration
- Return type with all necessary methods and state

### Step 3: UI Components

**Files:**

- `src/components/BulkSelectionToolbar.tsx` - Sticky bottom toolbar
- `src/components/BulkPriceUpdateModal.tsx` - Price update dialog with Zod validation
- `src/components/BulkCategoryChangeModal.tsx` - Category change dialog
- `src/components/BulkDeleteConfirmModal.tsx` - Delete confirmation with "DELETE" typing
- `src/components/Toast.tsx` - Reusable toast notification with auto-dismiss

### Step 4: Updated Components

**Files:**

- `src/components/ProductCard.tsx` - Add checkbox (top-left corner)
- `src/app/page.tsx` - Integrate bulk operations hook and toolbar
- Add "Select All" checkbox to page header

### Step 5: Tests

**Files:**

- `src/hooks/__tests__/useBulkOperations.test.ts` - Unit tests for hook
- `src/components/__tests__/BulkOperations.test.tsx` - Integration tests
- Test coverage: selection, operations, undo, error handling, accessibility

### Step 6: Documentation

- Update `README.md` with bulk operations usage section
- Add JSDoc comments to all new functions

</DELIVERABLES>

---

<EXAMPLES>

## Example 1: Selection State Management

**Input:** User clicks "Select All" with 10 filtered products
**Expected State:**

```typescript
{
  selectedProductIds: Set(['id1', 'id2', ..., 'id10']),
  selectionCount: 10,
  isAllSelected: true,
  isIndeterminate: false
}
```

**Input:** User then unchecks one product
**Expected State:**

```typescript
{
  selectedProductIds: Set(['id1', 'id2', ..., 'id9']),
  selectionCount: 9,
  isAllSelected: false,
  isIndeterminate: true
}
```

## Example 2: Price Update with Percentage

**Input:** User selects 3 products and chooses +15% price increase
**Products Before:**

```typescript
[
  { id: "1", name: "Mouse", price: 29.99 },
  { id: "2", name: "Cable", price: 9.99 },
  { id: "3", name: "Keyboard", price: 79.99 },
];
```

**Expected Preview:**

```
Mouse: $29.99 → $34.49
Cable: $9.99 → $11.49
Keyboard: $79.99 → $91.99
```

**Products After Confirmation:**

```typescript
[
  { id: "1", name: "Mouse", price: 34.49 },
  { id: "2", name: "Cable", price: 11.49 },
  { id: "3", name: "Keyboard", price: 91.99 },
];
```

## Example 3: Undo Operation

**Scenario:** User updates 5 products' prices, then clicks "Undo" within 5 seconds

**Expected Behavior:**

1. Show toast: "Successfully updated 5 products [Undo]"
2. User clicks "Undo" button
3. Show loading state on toast
4. Revert all 5 products to original prices via API calls
5. Show new toast: "Changes reverted"
6. Clear undo history (can't undo the undo)

</EXAMPLES>

---

<CHAIN_OF_THOUGHT>

**Before implementing, please think through and answer these questions:**

1. **State Management:** Should I use React Context to share selection state, or is prop drilling acceptable for this feature? Consider: How many component levels deep will the state need to flow?

2. **Undo Storage:** Should undo operations be stored in localStorage for persistence across page refreshes, or only in memory? Consider: User expectations and data consistency.

3. **Atomic vs. Partial Operations:** Should bulk operations be all-or-nothing (atomic), or allow partial success? Consider: The current API doesn't support transactions.

4. **Selection Persistence:** When a bulk delete succeeds, should we clear the selection or keep it? Consider: User workflow and expectations.

5. **Performance:** With 100+ products, how will we optimize the selection checkbox rendering? Consider: React.memo, useCallback, and virtualization.

**Please provide your reasoning for each decision before starting implementation.**

</CHAIN_OF_THOUGHT>

---

<SUCCESS_CRITERIA>

Your implementation will be considered complete when:

- [ ] All 10 feature requirements are fully implemented
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm test` passes with >80% code coverage
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] Manual testing confirms all user flows work correctly
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader testing passes (VoiceOver/NVDA)
- [ ] All modals are accessible and follow WCAG AA guidelines
- [ ] No console errors or warnings in browser DevTools
- [ ] Performance profiling shows no significant re-render issues

</SUCCESS_CRITERIA>

---

- Include usage examples

---

### 🎯 Success Criteria

- [ ] Users can select multiple products via checkboxes
- [ ] "Select All" works correctly with filtered results
- [ ] All three bulk actions (price, category, delete) work as expected
- [ ] Confirmation dialogs prevent accidental operations
- [ ] Undo functionality successfully reverts the last operation
- [ ] All operations show appropriate loading and error states
- [ ] Feature is fully keyboard accessible
- [ ] No TypeScript errors or warnings
- [ ] All tests pass (`npm test`)
- [ ] No ESLint errors (`npm run lint`)

---

### 💡 Implementation Hints

- Consider using React Context to avoid prop drilling for selection state
- Use `useCallback` and `useMemo` to optimize performance
- Leverage Zod for validating bulk operation inputs
- Follow the existing pattern in `ProductFilters.tsx` for form handling
- Use the existing `Button` component for consistency
- Modal backdrop should use `fixed inset-0 bg-black bg-opacity-50`

---

### ❓ Questions to Address

Before starting implementation, please confirm:

1. Should selections persist across page navigation, or clear on unmount?
2. For undo, should we store the operation in localStorage for persistence?
3. Should bulk operations be atomic (all-or-nothing) or allow partial success?
4. What should happen to selections when a bulk delete succeeds?

---

## 3. Collaboration Approach

**How would you iterate and collaborate with the AI tool to implement this feature?**

I would follow a **structured, incremental approach** with clear validation checkpoints:

---

### **Phase 1: Planning & Architecture (5-10 minutes)**

**Prompt 1: Architecture Review**

- Ask the AI to propose the component hierarchy and data flow
- Request a state management strategy (Context vs. prop drilling)
- Review the proposed file structure and naming conventions
- **Validation:** Ensure the architecture aligns with existing patterns and doesn't introduce unnecessary complexity

**Prompt 2: Type Definitions First**

- Request complete TypeScript interfaces and types
- Review for type safety and extensibility
- **Validation:** Run `npm run type-check` to ensure no errors

---

### **Phase 2: Core Logic Implementation (15-20 minutes)**

**Prompt 3: Build the Selection Hook**

- Implement `useBulkOperations` hook with selection management
- Include unit tests for the hook
- **Validation:**
  - Run tests: `npm test -- useBulkOperations`
  - Manually test selection logic in isolation

**Prompt 4: Integrate Selection into ProductCard**

- Modify `ProductCard` to include checkbox
- Ensure memoization to prevent re-renders
- **Validation:**
  - Check DevTools React Profiler for performance
  - Test keyboard navigation and screen reader compatibility

**Prompt 5: Build the Toolbar Component**

- Implement `BulkSelectionToolbar` with action buttons
- **Validation:**
  - Test sticky positioning on scroll
  - Verify responsive behavior on mobile

---

### **Phase 3: Bulk Actions & Modals (20-25 minutes)**

**Prompt 6: Price Update Modal**

- Implement modal with percentage/fixed price modes
- Add Zod validation for inputs
- **Validation:**
  - Test edge cases (negative percentages, very large numbers)
  - Verify modal accessibility (focus trap, Escape key)

**Prompt 7: Category Change Modal**

- Implement category selection modal
- **Validation:** Test with different selection sizes

**Prompt 8: Delete Confirmation Modal**

- Implement with "DELETE" typing requirement
- **Validation:** Test safety mechanism thoroughly

**Prompt 9: Execute Bulk Operations**

- Implement API call logic with error handling
- Add loading states and progress indicators
- **Validation:**
  - Test with mock API delays
  - Simulate partial failures

---

### **Phase 4: Undo & Polish (10-15 minutes)**

**Prompt 10: Undo Functionality**

- Implement undo logic and toast notification
- **Validation:**
  - Test undo for each operation type
  - Verify 5-second auto-dismiss works

**Prompt 11: Error Handling & Edge Cases**

- Request comprehensive error handling
- Add user-friendly error messages
- **Validation:**
  - Test network failures
  - Test concurrent operations
  - Test empty selections

---

### **Phase 5: Testing & Documentation (10-15 minutes)**

**Prompt 12: Integration Tests**

- Request end-to-end tests for complete workflows
- **Validation:** Run full test suite: `npm test`

**Prompt 13: Accessibility Audit**

- Ask AI to review for WCAG compliance
- Request ARIA attribute improvements
- **Validation:**
  - Test with keyboard only
  - Test with VoiceOver/NVDA screen reader
  - Run Lighthouse accessibility audit

**Prompt 14: Documentation**

- Request README updates and JSDoc comments
- **Validation:** Review for clarity and completeness

---

### **Iterative Refinement Strategy**

After each phase, I would:

1. **Review the code** - Check for adherence to requirements and existing patterns
2. **Test thoroughly** - Run automated tests and manual testing
3. **Provide feedback** - If issues found, provide specific, actionable feedback:
   - ✅ "The selection logic works, but the 'Select All' doesn't handle filtered results correctly. Please update to only select visible products."
   - ✅ "The modal is missing focus trap. Please add focus management using a ref."
4. **Request incremental fixes** - Don't ask to rewrite everything; target specific issues
5. **Validate fixes** - Re-test after each iteration

---

### **Communication Best Practices**

- **Be specific:** Instead of "fix the bug," say "the undo function doesn't restore the original prices correctly when using percentage updates"
- **Provide context:** Share error messages, console logs, and expected vs. actual behavior
- **Ask for explanations:** "Why did you choose Context over prop drilling here?"
- **Request alternatives:** "Are there other approaches to handling partial failures?"
- **Celebrate wins:** "The toolbar looks great! Let's move to the modals."

---

### **Fallback Strategy**

If the AI produces code that doesn't work or doesn't meet requirements:

1. **Narrow the scope:** Break the task into smaller pieces
2. **Provide examples:** Share existing code patterns to follow
3. **Debug together:** Share the error and ask for specific fixes
4. **Switch tools:** If Claude struggles with a specific issue, try GitHub Copilot for targeted fixes
5. **Manual intervention:** Be prepared to write critical sections myself if needed

---

### **Final Validation Checklist**

Before considering the feature complete:

- [ ] All success criteria met
- [ ] `npm run build` succeeds
- [ ] `npm test` passes with >80% coverage
- [ ] `npm run lint` shows no errors
- [ ] `npm run type-check` passes
- [ ] Manual testing on Chrome, Firefox, Safari
- [ ] Mobile responsive testing
- [ ] Keyboard navigation works completely
- [ ] Screen reader testing completed
- [ ] Code reviewed for security issues (XSS, injection)
- [ ] Performance profiling shows no regressions

---

**Total Estimated Time:** 60-85 minutes (with buffer for debugging and refinement)
