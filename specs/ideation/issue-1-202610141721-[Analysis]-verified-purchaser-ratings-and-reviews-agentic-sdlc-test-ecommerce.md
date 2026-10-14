# Business Spec: Verified Purchaser Ratings and Reviews (Agentic-SDLC-test/ecommerce-react-native-example#1)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#1](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/1)
> Reporter: sushaanpatel-ibm · Story points: not estimated
> Labels: epic

## Product summary

EasyBuy will let customers who have received a product give it a star rating and, if they want, a short written review. Every product detail page will show the average rating, the total number of reviews, a breakdown by star level, and the most recent written reviews. Each review carries a "Verified Purchase" indicator. Administrators get a simple moderation tool to hide, unhide, or remove reviews.

The goal is more buyer confidence and better conversion, using feedback shoppers can trust because only real buyers can leave it.

## Business problem

From Epic Agentic-SDLC-test/ecommerce-react-native-example#1 (verbatim):

> Enable verified purchasers to submit a star rating and a short written review for products they have purchased. Aggregate ratings and recent reviews will be displayed on the product detail page, supported by lightweight administrative moderation.
>
> Customer reviews increase buyer confidence and improve conversion rates. Restricting submissions to verified purchasers ensures the authenticity of review content and reduces the incidence of spam and fraudulent ratings.

Today a shopper looking at a product in EasyBuy sees only its image, price, description and stock. They can add it to the cart or wishlist, but nothing shows what other buyers thought of it. EasyBuy has no ratings or reviews of any kind, so shoppers lack the social proof that typically drives purchase decisions. Opening reviews to anyone would invite spam and fake ratings. The value of this feature depends on limiting reviews to people who actually bought and received the product.

## Goals and non-goals

- **Goal:** Let customers who have received a product rate it from 1 to 5 stars and optionally add a short written review.
- **Goal:** Show shoppers trustworthy social proof on every product detail page: the average rating, the review count, the star distribution and recent reviews.
- **Goal:** Keep review content authentic by limiting reviews to verified purchasers and labelling every review "Verified Purchase".
- **Goal:** Give administrators a lightweight way to deal with inappropriate reviews after they are published.
- **Goal:** Allow one review per customer per product, which the customer can edit later.
- **Non-goal:** Photo or video reviews.
- **Non-goal:** Voting on whether a review was helpful.
- **Non-goal:** Replies to reviews from the store or from other customers.
- **Non-goal:** An approval queue before publication. Reviews go live immediately (PO decision, Q-2).
- **Non-goal:** Custom sorting and filtering of reviews (for example, highest or lowest rated, or by star level) in this release. Reviews appear newest first.
- **Non-goal:** Showing star ratings on product lists, search results or category pages. Ratings appear only on the product detail page in this release.

## Personas and users

- **Shopper (any visitor browsing products):** Sees the rating summary and recent reviews on the product detail page and uses them to decide whether to buy.
- **Verified purchaser (signed-in customer with a delivered order containing the product):** Can leave one rating per product, with optional text, and edit it later. Sees their own review on the product page.
- **Customer without a delivered order for the product:** Can read reviews but cannot write one. The app tells them that reviewing opens once their order is delivered.
- **Administrator:** Already manages products, categories, orders and users in the admin dashboard. Gains the ability to review all customer reviews and to hide, unhide or permanently remove any of them.

## Business requirements

- **BR-1 (Verified purchaser eligibility):** A customer may review a product only if they have at least one order containing that product with status Delivered (PO decision, Q-1). Pending and Shipped orders do not qualify. The system enforces this rule itself; hiding the button in the app is not enough.
- **BR-2 (Rating required, text optional):** Every review must include a star rating from 1 to 5 in whole stars. Written text is optional (PO decision, Q-3) and limited to 500 characters.
- **BR-3 (One review per customer per product):** Each customer has at most one review per product, no matter how many times they bought it. If they already have one, they are offered the option to edit it instead of creating another.
- **BR-4 (Editing):** A customer can change the rating, the text, or both on their own review at any time. The edit goes live immediately, the review moves to the top of the newest-first list based on its last-updated date, and it is marked "Edited". Customers cannot delete their own review in this release; they can edit it.
- **BR-5 (Immediate publication):** New and edited reviews appear on the product page as soon as they are submitted, with no prior approval (PO decision, Q-2).
- **BR-6 (Product page summary):** The product detail page shows the average rating rounded to one decimal place, the total number of reviews, and a 5-to-1 star distribution with a count for each level. Every visible review counts toward these figures, whether or not it has text.
- **BR-7 (Recent reviews):** The product detail page shows up to the 5 most recent visible reviews that have written text, newest first. Each shows the reviewer's display name, the star rating, the date, the text and the "Verified Purchase" indicator. Shoppers can open a full list of all visible written reviews for the product, also newest first. Rating-only reviews count toward the summary but do not appear in these lists (Q-3).
- **BR-8 (Verified Purchase indicator):** Every displayed review shows a "Verified Purchase" indicator. Because only verified purchasers can review, every review qualifies.
- **BR-9 (Empty state):** A product with no visible reviews shows a clear "No reviews yet" state instead of a zero average.
- **BR-10 (Admin moderation: hide and unhide):** Administrators can hide any review and unhide it later. A hidden review disappears from all customer-facing views and from the average, count and distribution, but is kept so it can be restored. This toggle is what the Epic calls "toggle review visibility".
- **BR-11 (Admin moderation: remove):** Administrators can permanently remove any review after confirming. A removed review cannot be restored. The customer may then leave a new review for that product if they are still eligible.
- **BR-12 (Admin review list):** The admin dashboard gets a review moderation area that lists reviews newest first, showing the product, the reviewer, the rating, the text, the date and whether the review is visible or hidden.
- **BR-13 (Author's view of a hidden review):** If an admin hides a customer's review, that customer still sees it in their own edit view, labelled as hidden by the store. Other shoppers do not see it. Editing a hidden review does not make it visible again.
- **BR-14 (Discoverability for customers):** Eligible customers can start or edit a review from the product detail page. They can also start one from the details of a delivered order, for each product in that order.
- **BR-15 (Consistency across platforms):** Ratings and reviews behave the same on iOS, Android and web, and the local development mock server supports them so the feature can be demonstrated and tested without the production backend.

## Acceptance criteria

Epic acceptance criteria (verbatim), each refined with the PO's decisions:

1. **Only verified purchasers may submit a review for a given product.**
   - A signed-in customer with a Delivered order containing the product can submit a review.
   - A customer whose only orders for the product are Pending or Shipped cannot submit one. They see a message that reviewing opens once the order is delivered.
   - A customer who never ordered the product, and a visitor who is not signed in, cannot submit a review.
   - The system rejects a review attempt by an ineligible customer even if it does not come from the app's own screens.
2. **Each customer may submit one review per product, with the ability to edit it.**
   - A second submission by the same customer for the same product is not created as a separate review. The customer is directed to edit their existing one.
   - The customer can change the star rating and the written text. The update appears immediately, labelled "Edited".
   - A rating without text is accepted. A submission without a star rating is rejected with a clear message. Text over 500 characters is rejected.
3. **The product detail page displays the average rating, total review count, rating distribution, and recent reviews.**
   - The average is shown to one decimal place, along with the total count and a 5-to-1 star breakdown. All of these include rating-only reviews and exclude hidden ones.
   - Up to the 5 most recent visible written reviews appear newest first, and the full newest-first list is reachable from the page.
   - A product with no visible reviews shows "No reviews yet".
   - A newly submitted or edited review shows up in these figures without an administrator having to act.
4. **Reviews display a "Verified Purchase" indicator.**
   - Every review shown on the product page, in the full review list and in the admin moderation list carries the "Verified Purchase" indicator.
5. **Administrators can hide or remove reviews and toggle review visibility.**
   - An administrator can hide a visible review. It immediately disappears from customer-facing views and stops counting toward the product's figures.
   - An administrator can unhide a hidden review. It immediately reappears and counts again.
   - An administrator can permanently remove a review after confirming. It is gone from every view and cannot be restored.
   - Customers, including the review's author, cannot hide, unhide or remove reviews.

## Assumptions and constraints

- **Decided by PO (Q-1):** Verified purchaser means the customer has at least one Delivered order containing the product.
- **Decided by PO (Q-2):** Reviews publish immediately, and moderation happens afterwards.
- **Decided by PO (Q-3):** A star rating is required and written text is optional. Rating-only reviews count toward the summary but are not listed.
- **Agent decision (Epic open question on sorting):** Review lists are newest first only. Sorting by rating and filtering by star level are deferred to a later release because they are not needed to meet any acceptance criterion.
- **Agent decision:** "Toggle review visibility" in AC-5 means hiding and unhiding an individual review. A store-wide or per-product switch to turn reviews off is not included.
- **Agent decision:** Written text is limited to 500 characters to keep reviews "short" as the Epic describes. Plain text only; no links or formatting.
- **Agent decision:** The reviewer is shown by their account display name. No other personal details, such as email, appear.
- **Agent decision:** Customers cannot delete their own review in this release; they can edit it. Only administrators remove reviews.
- **Agent decision:** If an administrator later moves a Delivered order back to an earlier status, existing reviews stay. Eligibility is checked when a review is submitted or edited.
- **Agent decision:** When a customer account is deleted, that customer's reviews are removed with it. When a product is deleted, its reviews are removed too.
- **Constraint:** Order status is the only proof of purchase available. The store has no separate payment-confirmation status, and administrators set Delivered manually, so verification depends on admins keeping order statuses up to date.
- **Constraint:** All app communication with the backend goes through the shared EasyBuy API client package, so new review capabilities must be added there before the app can use them.
- **Constraint:** The feature must work on iOS, Android and web from one app codebase.

## Dependencies

- **EasyBuy backend service (separate repository):** Must store reviews, enforce the verified-purchaser and one-review-per-product rules, calculate the rating summary, and provide admin moderation actions. This is the primary dependency and the trust boundary for authenticity.
- **Shared EasyBuy API client package (separate repository, published package):** Needs new review capabilities and a new published version that the app then adopts.
- **Local mock server (in this repository):** Needs matching review behaviour and seeded delivered orders and reviews so the feature can be developed, demonstrated and tested locally. The mock server already includes a seeded delivered order.
- **Existing order lifecycle:** Eligibility relies on the existing Pending, Shipped and Delivered statuses and on admins marking orders Delivered.
- **Existing admin dashboard and sign-in:** Moderation reuses the existing admin role and dashboard, and reviewing reuses the existing customer sign-in.

## Risks

- **Eligibility enforced only in the app:** If only the app blocks ineligible customers, anyone calling the backend directly could post fake reviews, which defeats the main purpose of the feature. *Mitigation:* the backend enforces every rule (BR-1, BR-3), and tests cover rejected attempts.
- **Stale order statuses delay reviews:** Admins set Delivered manually. If they fall behind, genuine buyers cannot review and review volume stays low. *Mitigation:* tell customers clearly why reviewing is not open yet. Consider adding a reminder to admin order handling (out of scope here).
- **Abusive content goes live before moderation:** With immediate publication (Q-2), offensive text is visible until an admin hides it. *Mitigation:* the admin list shows newest reviews first so new content is easy to check, and hiding takes effect immediately. Add automated filtering later if volume grows.
- **Cross-repository delivery coordination:** The backend, the API client package and the app are separate deliverables. A mismatch would break the feature or the build. *Mitigation:* deliver in order (backend and client first, then the app) and keep the mock server in step for testing.
- **Low early review volume:** With few reviews, a single rating can swing a product's average. *Mitigation:* always show the review count next to the average so shoppers can judge reliability.
- **Privacy of reviewer identity:** Showing reviewer names publicly exposes customer data. *Mitigation:* show only the display name and never the email address or order details.

## Open questions

None of these block Design:

- Should a later release add sorting by rating and filtering by star level? (Deferred; see Assumptions and constraints.)
- Should star ratings appear on product lists and search results in a later release to help browsing?
- Should customers be notified when an administrator hides or removes their review?
- Should the product appear in the customer's order history as ready to review, with a reminder, once delivered?

## Initial implementation plan

- **Step 1: Backend capability.** Add reviews to the EasyBuy backend: submitting, editing and reading reviews, the verified-purchaser and one-review-per-product rules, the rating summary, and admin hide, unhide and remove.
- **Step 2: Shared client and mock server.** Add the review capabilities to the shared API client package and publish a new version. Add matching behaviour and seed data to the local mock server.
- **Step 3: Product page experience.** Show the rating summary, the distribution, recent reviews, the full newest-first list and the empty state on the product detail page, with the "Verified Purchase" indicator.
- **Step 4: Write and edit flow.** Let eligible customers create or edit their review from the product page and from delivered order details, with clear messages for customers who are not yet eligible.
- **Step 5: Admin moderation.** Add a review moderation area to the admin dashboard with hide, unhide and confirmed remove.
- **Step 6: Verification.** Add automated tests for eligibility, one-review-per-product, rating-only submissions, summary figures and moderation effects, then run an end-to-end check on iOS, Android and web against the mock server.

## Validation summary

The draft has all 12 required sections with concrete content and no placeholders, so all blocking DoD checks for `alora.default.v1` pass. All five Epic acceptance criteria are kept verbatim and refined with measurable conditions. The PO's three decisions (Q-1 delivered-order eligibility, Q-2 immediate publication with reactive moderation, Q-3 rating required and text optional) are applied throughout. The Epic's remaining open question on sorting and filtering is resolved as newest-first only and recorded as an assumption. The remaining open questions are future enhancements and do not block Design. The main thing to watch is that eligibility must be enforced in the separate backend service, not only in the app.