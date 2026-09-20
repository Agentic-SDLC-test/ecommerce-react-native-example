# Business Spec: Digital Payment Options at Checkout (Agentic-SDLC-test/ecommerce-react-native-example#3)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#3](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/3)
> Reporter: sushaanpatel-ibm · Story points: Not estimated
> Labels: epic

## Product summary

EasyBuy customers can currently only pay Cash on Delivery (COD) — there is no way to pay digitally in the app today. This work adds at least one digital, in-app payment path (for example a mock wallet, a card placeholder, or a redirect-style flow) as an alternative to COD at checkout. Every order will remember which payment method the customer chose and what its payment status is, and that information will be visible to the customer right after purchase, in their order history, and to admins reviewing orders. This removes a real friction point for customers who prefer not to pay in cash and gives the business a foundation for real payment processing later.

## Business problem

Today, checkout in EasyBuy (Agentic-SDLC-test/ecommerce-react-native-example#3) hardcodes Cash on Delivery as the only way to pay — customers are never asked to choose, and the app never records anything about *how* an order was paid beyond "COD." This is a gap for any customer who would rather pay digitally, and it blocks the business from ever distinguishing a paid order from an unpaid one, since the only status the app tracks today is delivery progress (placed, shipped, delivered), not payment outcome. The Epic asks us to close this gap: let customers pick a digital payment path in addition to COD, and make sure the payment method and its status travel with the order everywhere the order is shown — confirmation, the customer's order history, and admin order views.

## Goals and non-goals

- **Goal:** Offer customers at least one digital payment option (e.g. a mock wallet, a card placeholder, or a redirect-style flow) alongside Cash on Delivery at checkout.
- **Goal:** Record the payment method chosen and a payment status (e.g. pending, paid, failed) on every order, separate from delivery/fulfillment status.
- **Goal:** Show payment method and payment status on the order confirmation screen, in the customer's order history, and in the admin order views.
- **Non-goal:** Integrating a real, live payment processor or gateway — the new digital path(s) are simulated/mocked, consistent with the Epic's own wording ("placeholder", "mock").
- **Non-goal:** Capturing or storing real card numbers or other sensitive payment credentials.
- **Non-goal:** Supporting refunds, partial payments, split payments, or more than one payment method per order.
- **Non-goal:** Changing how Cash on Delivery behaves today — COD must keep working exactly as it does now.

## Personas and users

- **Customer (shopper):** chooses a payment method during checkout, and afterward wants to see — on the confirmation screen and later in their order history — how they paid and whether that payment went through.
- **Store admin:** reviews and fulfills orders today by delivery status alone; needs to also see how each order was paid and its payment outcome so they can tell a paid digital order apart from a COD order awaiting cash collection.

## Business requirements

- **BR-1:** Checkout must let the customer choose between Cash on Delivery and at least one digital payment path before submitting the order.
- **BR-2:** The system must record which payment method the customer chose against the order.
- **BR-3:** The system must track a payment status for every order (e.g. pending, paid, failed), kept separate from the existing delivery/fulfillment status (pending, shipped, delivered).
- **BR-4:** The order confirmation screen shown right after checkout must display the payment method used and its status.
- **BR-5:** The customer's order history (both the order list and an individual order's detail) must display the payment method and status for that order.
- **BR-6:** Admin order views (both the order list and an individual order's detail) must display the payment method and status for each order.
- **BR-7:** Choosing Cash on Delivery must produce the exact same checkout outcome customers get today — no behavior change for COD orders.

## Acceptance criteria

1. At checkout, the customer can choose Cash on Delivery or at least one digital payment option before placing the order.
2. Placing an order stores both the payment method chosen and a payment status against that order.
3. The order confirmation screen displays the payment method and payment status for the order just placed.
4. The customer's order history — both the list of past orders and an individual order's details — shows the payment method and status for each order.
5. Admin order views — both the order list and an individual order's details — show the payment method and status for each order.
6. Choosing Cash on Delivery results in the same checkout experience and order outcome as today, with no regressions.
7. When a digital payment attempt does not succeed, the customer receives a clear outcome and the order's payment status reflects that outcome (exact handling depends on the open question below).

## Assumptions and constraints

- The digital payment path(s) are simulated/mocked for this release — no real payment processor, card network, or bank integration is in scope, per the Epic's "placeholder"/"mock" language.
- No real card numbers, bank details, or other sensitive payment credentials will be collected or stored; any "card" path is a demo entry form only.
- Cash on Delivery remains the default, pre-selected payment method at checkout so existing customer behavior is unaffected unless they actively choose a digital option.
- The order total, currency, and pricing logic are unaffected by which payment method is chosen.
- Checkout already requires the customer to be signed in; this work does not add or change guest checkout.
- Payment status is a new, separate piece of order state from delivery/fulfillment status; the two must never be merged or conflated in what customers or admins see.

## Dependencies

- Design stage must define the concrete payment method options, the payment status values and their lifecycle, and how each is presented on checkout, confirmation, order history, and admin order screens.
- No external payment provider account, contract, or credential is required, since the digital path is simulated rather than a live integration.
- No other in-flight workstream currently owns checkout, order confirmation, or order history, so this can proceed without cross-team coordination.

## Risks

- **Customer confusion about what "digital payment" means here:** because the path is simulated, customers, testers, or reviewers could mistake it for a real payment method. *Mitigation:* clearly label the digital option(s) as a demo/mock experience in the UI copy.
- **Mixing payment status with delivery status:** if the two statuses are not kept visually and structurally distinct, customers or admins could misread a "paid" order as "delivered" or vice versa. *Mitigation:* treat payment status as its own labeled field everywhere it is shown.
- **Checkout friction / abandonment:** adding a mandatory choice to checkout could slow down or confuse customers who just want COD. *Mitigation:* pre-select COD by default so the added step is opt-in for digital payment.
- **Unclear failure handling increases support burden:** if it is not decided upfront what happens when a digital payment does not succeed, customers may be left with an ambiguous order state. *Mitigation:* resolve the open question below before Design begins.
- **Scope creep from the Epic's "at least one" wording:** the Epic allows for card, wallet, or redirect-style paths without picking one, which could balloon delivery scope if all three are attempted at once. *Mitigation:* the open question below asks the PO to commit to a starting scope.
- **This remains demo-grade only:** since no real processor is integrated, this capability cannot be relied on for actual revenue collection until a real payment gateway is integrated in a future initiative.

## Open questions

- Which digital payment path(s) should ship first — a mock wallet, a card placeholder, a redirect-style flow, or more than one? See Q-1.
- When a digital payment attempt fails, should the order be blocked from being created, or created anyway with a failed/pending payment status for later resolution? See Q-2.
- Do admins need to manually change an order's payment status themselves, or is payment status fully system-set and admin-viewable only? See Q-3.
- Should the digital payment path be available for every order regardless of amount, or are there limits (e.g. minimum/maximum order value) the business wants enforced? No option is proposed yet because the Epic gives no signal either way; flagging for Design/PO awareness rather than blocking this spec.

## Initial implementation plan

- Add a payment method choice to the checkout flow, presenting Cash on Delivery alongside the agreed digital option(s), with Cash on Delivery pre-selected.
- Extend what an order remembers so it captures both the payment method chosen and a payment status, kept distinct from delivery/fulfillment status.
- Update the order confirmation screen to show the customer the payment method and status for the order they just placed.
- Update the customer's order history (list and detail views) to show payment method and status per order.
- Update admin order views (list and detail) to show payment method and status per order, so admins can distinguish how each order was paid.
- Confirm, through targeted regression checks, that choosing Cash on Delivery still behaves exactly as it does today.

## Validation summary

All twelve required sections are present with concrete, requirement-grounded content; no placeholders remain. The Epic's business problem and intent are preserved verbatim in "Business problem," and every acceptance criterion above traces back to the Epic description (which itself listed no pre-existing acceptance criteria). Three blocking-leaning decisions remain open for the Product Owner — which digital payment path(s) to build first, how to handle a failed digital payment, and whether admins need manual control over payment status — and are raised as clarifying questions rather than assumed, since each materially changes scope or business rules. All other ambiguities were resolved with explicit, stated assumptions so the rest of the spec could be drafted in full. The Definition of Done checklist below passes on structural completeness; the open questions do not block this submission but should be resolved before Design finalizes the payment method and status model.
