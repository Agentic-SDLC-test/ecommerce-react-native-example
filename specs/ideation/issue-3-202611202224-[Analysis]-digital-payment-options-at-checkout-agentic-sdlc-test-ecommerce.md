# Business Spec: Digital Payment Options at Checkout (Agentic-SDLC-test/ecommerce-react-native-example#3)

## Product summary
EasyBuy shoppers can pay only by Cash On Delivery (COD) today. This epic adds at least one simulated digital payment path alongside COD. Orders will record how they were paid and the payment state. The order confirmation and the order history will show that state to shoppers, and to admins who review orders.

The payment path is simulated for now (a card placeholder or a mock wallet). It does not connect to a real payment provider.

## Business problem
Epic Agentic-SDLC-test/ecommerce-react-native-example#3 ("Test epic 2") states: "Extend checkout so users can choose at least one digital payment path (e.g. card placeholder, 'pay with wallet' mock, or redirect-style flow) in addition to COD. Orders store payment method and status; confirmation and order history reflect payment state."

What exists today:
- Checkout shows a fixed "Cash On Delivery" payment method that the shopper cannot change.
- Every order is placed as COD.
- The order record already carries a payment type, but it is always COD. No payment status exists.
- Order history and admin order views show the delivery status (pending, shipped, delivered) only.
- Shoppers have no digital option, and nobody can tell whether an order has been paid.

## Goals and non-goals
**Goals**
- Let shoppers choose between COD and at least one digital payment path at checkout.
- Store the payment method and a payment status on every order.
- Show payment method and state on the order confirmation and in order history.
- Show payment state to admins in their order views.
- Keep COD working as it does now.

**Non-goals**
- Integrating a real payment provider or handling real card data.
- Refunds, partial payments, saved cards, or wallet balance management.
- Changing the delivery status flow (pending, shipped, delivered).
- Real money movement, tax, or invoicing.

## Personas and users
- **Shopper (user):** picks a payment method at checkout, then sees the payment state on confirmation and in order history.
- **Admin:** reviews orders and needs to see how and whether each was paid.
- **Product owner / QA:** needs predictable simulated outcomes to demonstrate and test the flow.

## Business requirements
1. Checkout offers COD plus at least one digital option. The recommended option is a simulated card payment, with a mock wallet as a possible addition.
2. The shopper can switch between methods before placing the order. COD stays the default.
3. Each order stores its payment method and payment status.
4. Status rules:
   - COD orders start as "unpaid / pay on delivery".
   - Successful digital payments are "paid".
   - Failed digital payments are "failed", and no order is created without a clear message to the shopper.
5. The order confirmation shows the chosen method and payment state.
6. Order history shows the method and payment state for each order, and shows them consistently for older orders.
7. Admin order views show the payment method and state.
8. Existing orders without payment data display as COD / pay on delivery rather than blank.
9. The simulated digital flow must never ask for, transmit, or store real card numbers.
10. The local mock backend and the client must stay in step on the payment fields.
11. The feature works on iOS, Android, and web.

## Acceptance criteria
The epic lists no separate criteria. These are derived from its description:
1. A shopper can choose COD or at least one digital payment path at checkout.
2. COD checkout still works end to end.
3. After a successful digital payment, the order is saved with that method and status "paid".
4. Orders store both payment method and payment status.
5. A failed or cancelled digital payment shows a clear message. The shopper can retry or switch to COD, and no duplicate order is created.
6. The order confirmation shows the payment method and state.
7. Order history shows the payment method and state for every order, including older ones.
8. Admins can see payment method and state on orders.
9. Lint and tests pass, with new tests covering the payment choice and status display.

## Assumptions and constraints
- **Simulated only:** the digital path is a mock. The recommended default is a card placeholder form that always succeeds, with a simple way to force a failure for demos. No real payment provider is used.
- **Status set:** the payment states are pending (COD, pay on delivery), paid, and failed. Refunded is out of scope.
- **Admin changes:** admins cannot change payment state in this epic. Marking COD orders as paid on delivery is a possible follow-up.
- **Mock backend:** the local mock backend mirrors the production API. The production backend and the shared API client package must accept the new fields. The mock backend alone is not enough for a production release.
- **Data:** mock data resets on restart, so migration of old orders is not needed locally.
- **Display:** payment state is a separate indicator from delivery status.
- **Cart:** the cart is cleared only after a successful order, as it is today.

## Dependencies
- The shared API client package, which owns the order and payment vocabulary, may need a new version to carry payment status. This is a dependency on another repository.
- The production backend (the repository the mock server mirrors) must store and return the new fields.
- Design input is needed for the payment selection UI and the payment-state badges.

## Risks
- **Contract drift:** if the client, mock, and production backend disagree on payment fields, orders could fail or show wrong states. Mitigation: agree the fields first and update the mock in the same change.
- **Misleading "paid" status:** simulated payments could be mistaken for real ones. Mitigation: label the digital option clearly as a demo or test.
- **Sensitive data:** a card form invites real card entry. Mitigation: use a placeholder with no real data capture.
- **Older orders:** existing orders lack payment data and could show blanks. Mitigation: default them to COD / pay on delivery.
- **Duplicate orders:** retries after a failed payment could create duplicates. Mitigation: place the order only once the payment outcome is known.
- **Thin test coverage:** the project has very little automated testing today, which raises regression risk for checkout.

## Open questions
None are blocking. These are recorded as assumptions above and can be revisited by the PO:
- Which digital option should ship first: card placeholder (recommended), mock wallet, or redirect-style?
- Should admins be able to mark COD orders as paid?
- Is a "refunded" state needed later?

## Initial implementation plan
1. Agree the payment method and payment status vocabulary with the shared API client and backend owners.
2. Update the mock backend to accept, store, and return payment method and status. Default older orders to COD / pay on delivery.
3. Add a payment method selection to checkout, with COD as the default and a simulated digital option.
4. Simulate the digital payment outcome (success and failure), and handle failure and retry without creating duplicate orders.
5. Show payment method and state on the order confirmation, in the shopper's order history, and in admin order views.
6. Add tests for the method choice, status display, and the failure path. Run lint and tests.
7. Demo on iOS, Android, and web using the mock backend.

## Validation summary
All 12 required sections are present and concrete. The epic had no separate acceptance criteria, so they were derived from its description. All of the epic's points are covered: a digital option alongside COD, stored payment method and status, and payment state on the confirmation and order history. There are no blocking questions, and the decisions made are recorded as assumptions. The DoD checklist (alora.default.v1) passes.