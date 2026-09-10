# Business Spec: Digital Payment Options at Checkout (Agentic-SDLC-test/ecommerce-react-native-example#3)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#3](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/3)
> Reporter: sushaanpatel-ibm · Story points: _not set_
> Labels: epic

## Product summary

EasyBuy shoppers today can only pay one way: Cash on Delivery (COD). At checkout the payment method is shown as a fixed "Cash On Delivery" line with no way to choose anything else. This epic gives customers a real choice at the moment of purchase — they can pick COD **or** at least one digital payment path (for example, a card entry placeholder, a "pay with wallet" mock, or a redirect-style flow) before they place the order.

Alongside the choice, every order will remember **how** the customer chose to pay and **where that payment stands** (for example, awaiting payment, paid, or failed). The order confirmation screen and the customer's order history will surface this payment state so shoppers always know whether money has changed hands. Because EasyBuy runs against a mock backend for this work, the digital payment paths are **simulated** — no real money moves and no real card data is captured — but the end-to-end experience (choose method → see payment state → track it in history) is complete and realistic.

The outcome is a checkout that feels modern and trustworthy: customers are no longer forced into a single payment mode, and they get clear, consistent feedback about the payment status of each order.

## Business problem

Epic `Agentic-SDLC-test/ecommerce-react-native-example#3` states: *"Extend checkout so users can choose at least one digital payment path (e.g. card placeholder, 'pay with wallet' mock, or redirect-style flow) in addition to COD. Orders store payment method and status; confirmation and order history reflect payment state."*

Today the product supports exactly one payment method — Cash on Delivery — and it is not selectable; it is presented as the only option. As a result:

- **Customers who prefer to pay digitally have no path to do so**, which is out of step with expectations for a modern shopping app and limits who is willing to complete a purchase.
- **Orders carry a payment method value but no notion of payment state.** The product tracks a fulfillment lifecycle (processing → shipping → delivery) but has no concept of whether an order has been *paid*. For digital payments this is essential: a customer needs to know their payment succeeded, and the business needs to distinguish an unpaid order from a paid one.
- **After placing an order, customers get only a generic "order confirmed" message and, in their order history, a fulfillment status.** Neither reflects the payment method chosen or whether payment went through, so shoppers cannot answer the basic question "has this been paid?"

This epic closes those gaps by making payment method a genuine choice at checkout, introducing a payment-state concept on every order, and making that state visible where customers naturally look for it.

## Goals and non-goals

- **Goal:** Let a customer choose their payment method at checkout — COD plus at least one digital payment path — instead of being locked into COD.
- **Goal:** Record on every order both the payment method chosen and the payment state of that order.
- **Goal:** Reflect the payment method and payment state on the order confirmation screen immediately after purchase.
- **Goal:** Reflect the payment method and payment state in the customer's order history and order detail views.
- **Goal:** Keep the digital payment experience realistic end-to-end even though it is simulated against the mock backend.
- **Non-goal:** Integrating a real payment gateway or processor (e.g. Stripe, PayPal), moving real money, or handling real card/bank data. All digital payment paths are mocked for this work.
- **Non-goal:** PCI-DSS scope, storing or transmitting real cardholder data, or any regulated-payment compliance work.
- **Non-goal:** Refunds, chargebacks, partial payments, split payments, saved payment methods, or promo/coupon changes to the amount owed.
- **Non-goal:** Changing the existing fulfillment lifecycle (processing/shipping/delivery) or the admin order-status workflow beyond surfacing payment information.
- **Non-goal:** Multi-currency or tax/shipping-fee redesign — the current amount calculation is retained as-is.

## Personas and users

- **Shopper (registered customer):** The primary user. Browses, adds items to cart, and checks out. This persona gains the ability to choose a payment method and to see, at confirmation and in order history, which method was used and whether the order is paid.
- **Admin / store staff:** Manage orders and update fulfillment status. This persona benefits from seeing an order's payment method and payment state so they can tell paid orders from unpaid (e.g. COD to be collected on delivery) — the extent of admin-facing changes is an open question below.
- **Product Owner / business stakeholder:** Relies on payment-state data being captured on every order as the foundation for future reporting (e.g. paid vs. unpaid volume). No reporting UI is in scope here, but the data must be captured cleanly.

## Business requirements

- **BR-1 (Payment method choice):** At checkout, the customer can select a payment method from COD and at least one digital payment path before placing the order. The chosen method must be clearly indicated, and a method must be selected for the order to be submitted.
- **BR-2 (Digital payment experience):** Selecting a digital payment path presents a simulated payment step appropriate to that path (e.g. a card-detail placeholder form, a "pay with wallet" confirmation, or a redirect-style approve/return flow). No real payment credentials are processed or stored.
- **BR-3 (Persisted payment method):** Every order records the payment method the customer chose, replacing today's fixed COD value.
- **BR-4 (Payment state on orders):** Every order records a payment state that reflects whether it is awaiting payment, paid, or failed (final states subject to Q-2). COD orders and digital-payment orders may legitimately start in different states.
- **BR-5 (Confirmation reflects payment):** The order confirmation shown immediately after placing an order communicates the chosen payment method and the resulting payment state (e.g. "Paid by card" vs. "Cash on delivery — pay on arrival").
- **BR-6 (History reflects payment):** The customer's order history list and order detail view show the payment method and payment state for each order, alongside the existing fulfillment information.
- **BR-7 (Backward compatibility):** Existing orders and the existing COD flow continue to work; COD remains a valid, selectable choice and its behavior is unchanged for the shopper.
- **BR-8 (Failure handling — scope TBD):** If a simulated digital payment does not succeed, the customer is told and can retry or fall back to another method; the order's payment state reflects the failure. The exact scope of failure simulation is an open question (Q-3).
- **BR-9 (Non-functional — clarity & consistency):** Payment method and payment state are described in plain, consistent language across checkout, confirmation, and history, so the same order reads the same way everywhere.
- **BR-10 (Non-functional — cross-platform):** The experience works on iOS, Android, and web, consistent with the app's existing cross-platform support.

## Acceptance criteria

The linked Epic did not enumerate explicit acceptance criteria, so the following are derived from its description and confirmed against the current checkout and order behavior. They should be reviewed by the Product Owner.

1. At checkout, the customer can see and choose between COD and at least one digital payment path; the selected method is visibly indicated.
2. The customer cannot place an order without a payment method selected (COD remains selectable and continues to work exactly as today).
3. Choosing a digital payment path presents a simulated payment step matching that path; completing it returns the customer into the order-placement flow without processing any real payment data.
4. When an order is placed, the order stores the payment method the customer chose.
5. When an order is placed, the order stores a payment state consistent with the chosen method (e.g. a completed digital payment is recorded as paid; a COD order is recorded as awaiting payment / pay-on-delivery).
6. The order confirmation screen shown right after placing the order communicates both the payment method and the payment state.
7. The order history list shows, for each order, the payment method and payment state in addition to the existing fulfillment status.
8. The order detail view shows the payment method and payment state for the selected order.
9. Placing a COD order after this change produces the same shopper experience as before, aside from COD now being an explicit selectable choice.
10. The feature behaves consistently on iOS, Android, and web.
11. (Conditional on Q-3) If a simulated digital payment fails, the customer is informed, the order's payment state reflects the failure, and the customer can retry or choose another method.

## Assumptions and constraints

- **Simulated payments only:** Because this work targets the mock backend and the epic explicitly says "placeholder", "mock", and "redirect-style", all digital payments are simulated. No real gateway, money movement, or real card/bank data is involved. Working assumption pending Q-1 on which path(s) to build.
- **Payment state is a new, separate concept from fulfillment status:** The product already tracks a fulfillment lifecycle (processing → shipping → delivery). Payment state is introduced as an additional, independent attribute of an order and does not replace or reorder the fulfillment lifecycle. (Working assumption; lifecycle values pending Q-2.)
- **The order already carries a payment-method value:** The product already remembers a payment method on each order (fixed to COD today), so this work turns an existing fixed value into a customer choice rather than inventing the concept from scratch.
- **Amount owed is unchanged:** Totals, delivery cost, and discount behavior are used as-is; digital payment does not introduce fees, currency conversion, or tax changes.
- **Mock data resets:** The local mock backend holds data in memory and resets on restart; demos and tests should not assume persistence across restarts.
- **Authentication unchanged:** Checkout remains available to logged-in shoppers as today; this epic does not change sign-in or session behavior.

## Dependencies

- **Mock backend behavior:** The simulated payment paths and the new payment-state field depend on the local mock backend accepting and returning payment method and payment state on orders. If a real backend is later used, it must expose the same payment fields for parity.
- **Design-stage decisions:** The concrete payment-state values, the exact digital path(s), and failure handling depend on the clarifying answers below being resolved before Design finalizes the flow.
- **No external team/vendor dependency for this scope:** Because payments are mocked, there is no dependency on a payment provider, merchant account, or compliance review for this epic. (A real integration later would add all of these.)
- **Cross-platform delivery:** Depends on the existing iOS/Android/web support continuing to work through the new checkout step.

## Risks

- **Confusing two kinds of status:** If payment state and fulfillment status are presented without clear distinction, shoppers and admins may misread "paid" as "delivered" or vice-versa. *Mitigation:* keep them visually and verbally separate and label each explicitly.
- **"Mock" mistaken for real payment:** A realistic card/wallet screen could lead a user (or a demo audience) to believe real payment is taken. *Mitigation:* clearly mark digital paths as simulated/placeholder in the UI.
- **Scope creep toward a real gateway:** The digital-payment framing invites requests for real processing, refunds, or saved cards. *Mitigation:* the non-goals above bound this epic to a simulated experience; real integration is a separate future epic.
- **Inconsistent payment wording across screens:** Payment method/state shown differently on checkout, confirmation, and history would erode trust. *Mitigation:* define shared, plain-language terms once and reuse them (BR-9).
- **COD regression:** Turning a fixed value into a choice risks breaking the existing COD path or existing orders. *Mitigation:* explicit backward-compatibility requirement (BR-7) and coverage of the COD path in acceptance.
- **Under-specified failure behavior:** Without a decision on simulated failures, digital payments could silently "always succeed", hiding an important part of the experience. *Mitigation:* resolve Q-3 before Design.

## Open questions

- **Q-1 — Which digital payment path(s) are in scope?** The epic requires "at least one". We need to know which of card placeholder, wallet mock, or redirect-style flow to build (one is sufficient; more is optional). Raised as a clarifying question with recommended options.
- **Q-2 — What payment states should an order have, and how do they map to COD vs. digital?** For example, does COD start as "awaiting payment (pay on delivery)" and a digital payment become "paid" immediately? Raised as a clarifying question.
- **Q-3 — Is simulated payment failure in scope?** Whether digital payments can fail (and require retry/fallback) or always succeed for this epic. Raised as a clarifying question.
- **Admin visibility (non-blocking):** Should store staff also see payment method and payment state on the admin order views? Assumed "yes, read-only display" as a working assumption; flagged for PO confirmation but not blocking the draft.

## Initial implementation plan

- **Confirm the payment choices and states** with the Product Owner (resolve Q-1, Q-2, Q-3) so the experience is defined before Design begins.
- **Introduce a payment-method selector at checkout** offering COD plus the chosen digital path(s), replacing today's fixed COD display, and require a selection before the order can be placed.
- **Add the simulated digital payment step** for the selected path(s) so a customer completes a realistic, clearly-marked mock payment before the order is finalized.
- **Record payment method and payment state on every order** when it is placed, keeping payment state separate from the existing fulfillment lifecycle and preserving the COD path.
- **Surface payment method and payment state on the order confirmation** shown immediately after purchase.
- **Surface payment method and payment state in order history and order detail**, alongside the existing fulfillment status, using consistent wording.
- **Verify backward compatibility and cross-platform behavior** (COD unchanged for shoppers; feature works on iOS, Android, and web) and cover the new behavior with tests per the project's testing conventions.

## Validation summary

All twelve required business-spec sections are present with concrete, PO-facing content, so every blocking Definition-of-Done section check passes and the draft is structurally complete. The analysis is grounded in the current checkout and order behavior: the product already stores a payment method (fixed to COD) but has no payment-state concept, and confirmation/history show only fulfillment status today — which is exactly what this epic changes.

The Epic supplied no explicit acceptance criteria, so the criteria above were derived from its description and should be confirmed by the Product Owner. Three clarifying questions are raised — the choice of digital payment path(s) (Q-1) is treated as blocking because it shapes the requirements and acceptance criteria, while payment-state values (Q-2) and failure handling (Q-3) refine but do not block the draft. Every section has been drafted with explicit working assumptions so Design can proceed once these product decisions are confirmed.