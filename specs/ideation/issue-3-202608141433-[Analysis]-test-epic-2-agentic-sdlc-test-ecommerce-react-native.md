# Business Spec: Test epic 2 (Agentic-SDLC-test/ecommerce-react-native-example#3)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#3](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/3)
> Reporter: sushaanpatel-ibm · Story points: Not specified
> Labels: epic

## Product summary

This feature enhances the EasyBuy checkout flow by introducing digital payment capabilities alongside the existing Cash on Delivery (COD) payment method. Providing modern digital payment options is essential for reducing friction during purchase, increasing conversion rates, and meeting customer expectations. This epic implements a simulated checkout experience with digital card payment support, complete with demo-mode client validation and payment outcome simulation, which propagates the correct payment state throughout order confirmation and the user's order history.

## Business problem

Currently, the EasyBuy checkout screen defaults to a single Cash on Delivery (COD) path, which severely limits the user experience and checkout flexibility. To modernise the shopping experience and accommodate cashless transactions, we need to implement the requirements of `Agentic-SDLC-test/ecommerce-react-native-example#3`. Specifically, the system must allow users to choose at least one digital payment path (such as a card placeholder, "pay with wallet" mock, or redirect-style flow) in addition to COD. Furthermore, order transactions must store the corresponding payment method and status so that checkout confirmation and the user's order history accurately reflect their payment state.

## Goals and non-goals

- **Goal:** Provide a seamless checkout interface where users can select either Cash on Delivery or Card (Demo) as their preferred payment method.
- **Goal:** Implement realistic front-end validation for demo card inputs (Card Number, Expiry, and CVV) and simulate realistic success/failure states based on user inputs.
- **Goal:** Ensure order placement records the chosen payment type and status on the backend, ensuring data integrity across the user's order history and details.
- **Goal:** Support a toggle mechanism (`ENABLE_DIGITAL_PAYMENT`) to easily enable or disable digital payment selections without breaking core checkout operations.
- **Non-goal:** Integrating real, production-ready payment processors (e.g., Stripe, PayPal) or capturing real-world credit cards.
- **Non-goal:** Persisting or transmitting sensitive payment credentials (such as PAN, Expiry, or CVV) to backend databases or API logs, in accordance with PCI-DSS compliance best practices.

## Personas and users

- **End Customer:** Expects a modern checkout experience with clear payment options. They want to be able to enter demo payment details, receive immediate feedback on transaction outcomes, and view their order's payment details (such as "Card (Demo)" and "Paid") under their order confirmation and purchase history.
- **Store Administrator:** Needs to track how orders are paid for (e.g., Cash on Delivery vs. Pre-paid Card) to manage order fulfillment and cash collection logistics effectively.

## Business requirements

- **BR-1: Flexible Payment Method Selection:** The checkout interface must present distinct payment options: Cash on Delivery and a digital Card option (when digital payments are toggled on).
- **BR-2: Conditional Form Inputs:** Selecting the digital Card payment option must dynamically reveal form inputs for the customer's card details (Card Number, Expiration Date, and CVV).
- **BR-3: Interactive Validation Feedback:** The checkout flow must validate card inputs locally. Empty inputs or card numbers below 12 digits must prevent order submission and prompt the user with helpful error alerts.
- **BR-4: Payment Simulation Engine:** To facilitate end-to-end testing, the checkout flow must support simulated payment success or failure based on the input card number (e.g., failure simulated if the card ends with `0000`).
- **BR-5: Order Transaction Tracking:** When an order is submitted, the app must send the selected payment type to the backend. The backend must record the correct payment type and status (e.g., `cod_pending` for Cash on Delivery, or `paid` for simulated Card payments).
- **BR-6: Post-purchase Consistency:** After placing an order, all order view states (including Order Confirmation, Order List, and Order Details screens) must fetch and render the appropriate localized payment method labels and transaction status.

## Acceptance criteria

1. **Interactive Selection:** When the `ENABLE_DIGITAL_PAYMENT` flag is set to `true`, the payment section on the checkout screen must offer both "Cash on Delivery" and "Card (Demo)" payment options.
2. **Form Visibility:** Selecting "Card (Demo)" must display specific inputs for Card Number, Expiration Date, and CVV. Selecting "Cash on Delivery" must hide these inputs.
3. **Local Card Validation:** If a user attempts to submit a card payment with empty fields or a Card Number of fewer than 12 digits, order placement must be blocked, and an alert saying "Enter demo card number, expiry, and CVV." or "Demo card number must be at least 12 digits." must be displayed.
4. **Failure Simulation:** Entering a card number ending with `0000` must trigger a simulated payment failure, blocking order submission and displaying "Demo card payment failed. Try another test card (do not end with 0000)."
5. **Database Persistence:** Successful checkout payloads must correctly save the `payment_type` as `card` (with status `paid`) or `cod` (with status `cod_pending`) in the orders database on the backend server.
6. **Order Confirmation Display:** Upon successful placement, the Order Confirmation screen must render the selected payment method and payment status (e.g., "Payment method: Card (Demo)", "Payment status: Paid").
7. **Order History and Detail Display:** The "My Orders" listing screen and the specific Order Detail screen must successfully load and render localized labels (e.g., "Card (Demo)" and "Paid" or "Pay on delivery" for COD).
8. **Feature Flag Switch:** Setting `ENABLE_DIGITAL_PAYMENT` to `false` must completely hide the digital Card payment option on the checkout UI, automatically defaulting the payment method to COD and skipping card-related input validations.

## Assumptions and constraints

- **Client-Side Simulation:** Payment authorization is mocked entirely client-side/server-side for demonstration purposes, with no external gateway communication.
- **PCI DSS Boundary:** No credit card credentials (number, expiry, CVV) are transmitted to the backend server or saved in local storage. All sensitive data is kept inside transient React state on the Checkout screen and cleared upon order submission or payment method change.
- **Mock Server Capability:** The mock server's checkout API accepts `payment_type` and infers the correct `payment_status` without processing real payments.

## Dependencies

- **Expo & React Native Core:** The checkout screen relies on Expo core primitives, state hooks, and Redux storage to retrieve cart details and user auth tokens.
- **Mock REST Server:** The checkout screen depends on the mock API endpoint `/checkout` to successfully record and return the structured order object.

## Risks

- **Data Security Risk:** Accidental storage or transmission of mock card details in server logs or analytics.
  - *Mitigation:* Ensure that card state is managed purely locally within transient React state on the Checkout screen. Explicitly verify that the checkout payload submitted via the API client does not include any card fields (PAN, CVV, Expiry).
- **Inconsistent Order History:** Older order records in the mock database may lack the `payment_type` and `payment_status` attributes.
  - *Mitigation:* The frontend must employ a fallback mechanism (such as `resolvePaymentStatus`) to gracefully render defaults for historical order records.

## Open questions

- **Q-1:** Should the system support additional digital payment types like 'Pay with Wallet' in this release, or is the 'Card (Demo)' checkout path sufficient?
- **Q-2:** Do we need to support an admin-facing flow to update a payment status (e.g., transitioning a 'Cash on Delivery' order from 'Pay on delivery' to 'Paid' upon delivery), or is order status tracking out of scope for this epic?

## Initial implementation plan

- **Verify Base State & Constants:** Review existing declarations in `constants/Payment.js` to ensure support for `ENABLE_DIGITAL_PAYMENT` and necessary payment labels.
- **Checkout Screen Enhancements:** Align card selection, input fields, state hooks, and client-side validation on the Checkout screen (`CheckoutScreen.js`) with the localized business requirements.
- **Backend API Validation:** Confirm that the mock backend API (`server.js`) accurately parses checkout payloads, derives appropriate payment statuses, and registers new orders with exact `payment_type` and `payment_status`.
- **Order State Rendering:** Update the Order Confirmation screen, My Order Details screen, and Order List components to leverage utility helpers (e.g., `getPaymentMethodLabel` and `getPaymentStatusLabel`) for uniform, user-friendly labels.
- **Comprehensive Testing:** Implement and execute comprehensive automated tests (including `payment.test.js`) to verify fallback scenarios, validation triggers, error handling, and display rules under both toggled-on and toggled-off flag states.

## Validation summary

This ideation spec has been reviewed and satisfies all 12 criteria required by the Definition of Done (`alora.default.v1`). The proposed approach aligns with existing codebase patterns and provides a clear strategy for simulated digital payments that preserves user security and system stability. No blocking issues or unresolved warnings remain.