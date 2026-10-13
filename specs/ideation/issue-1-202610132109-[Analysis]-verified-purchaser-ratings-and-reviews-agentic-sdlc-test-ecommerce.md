# Business Spec: Verified Purchaser Ratings and Reviews (Agentic-SDLC-test/ecommerce-react-native-example#1)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#1](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/1)
> Reporter: sushaanpatel-ibm · Story points: not estimated
> Labels: epic

## Product summary

EasyBuy will let customers who have received a product leave a 1–5 star rating and, optionally, a short written review. The product detail page will show the product's average rating, total number of ratings, how ratings are spread across the five star levels, and the most recent written reviews, each marked "Verified Purchase". Reviews go live as soon as they are submitted. Administrators can hide, restore, or permanently remove any review from a new review-moderation area in the admin section.

This matters because shoppers currently have nothing but the merchant's own product description to go on. Authentic, purchase-backed feedback builds buyer confidence and is expected to improve conversion.

## Business problem

Epic Agentic-SDLC-test/ecommerce-react-native-example#1 states the requirement as:

> Enable verified purchasers to submit a star rating and a short written review for products they have purchased. Aggregate ratings and recent reviews will be displayed on the product detail page, supported by lightweight administrative moderation.
>
> Customer reviews increase buyer confidence and improve conversion rates. Restricting submissions to verified purchasers ensures the authenticity of review content and reduces the incidence of spam and fraudulent ratings.

Today EasyBuy has no ratings or reviews of any kind. The mobile app, the backend service, and the shared API client package used by the app have no review capability, even though older project notes suggest the backend already offers one. Shoppers therefore cannot see what other buyers think, and the business cannot use social proof to support purchase decisions. Any review feature must also guard against fake or spam reviews, which would erode the trust it is meant to build.

## Goals and non-goals

- **Goal:** Let customers rate, and optionally review, products they have actually received.
- **Goal:** Show shoppers a trustworthy summary of each product (average rating, total count, star distribution) and recent written reviews on the product detail page.
- **Goal:** Make it clear that every review comes from a verified purchaser.
- **Goal:** Give administrators simple, reactive control to hide, restore, or remove reviews.
- **Goal:** Keep spam and fraud low by allowing only delivered-order customers to review, with one review per customer per product.
- **Non-goal:** Photo or video reviews.
- **Non-goal:** Helpfulness voting ("Was this review helpful?").
- **Non-goal:** Replies to reviews, from the merchant or other customers.
- **Non-goal:** Pre-publication approval workflows. Moderation happens after publication.
- **Non-goal:** Sorting or filtering of reviews in this release (see Assumptions).
- **Non-goal:** Showing ratings on product cards in browse or search lists. This can follow once ratings exist.

## Personas and users

- **Shopper (any visitor browsing products):** sees the rating summary and recent reviews on the product detail page to help decide whether to buy.
- **Verified purchaser (signed-in customer with a delivered order containing the product):** can submit one rating, with optional text, per product, and can later edit it.
- **Signed-in customer without a delivered purchase:** can read reviews but is told that reviewing is available once their order for the product has been delivered.
- **Administrator:** monitors all reviews, hides inappropriate ones (reversibly), restores hidden ones, and permanently removes reviews that must not be kept.

## Business requirements

- **BR-1 Verified-purchase eligibility:** A customer may review a product only if they have at least one order containing that product that has reached the delivered stage. Pending and shipped orders do not qualify. The system enforces this rule itself, not just the app screen.
- **BR-2 Rating and optional text:** Every submission requires a whole-star rating from 1 to 5. A short written review (up to 500 characters) is optional.
- **BR-3 One review per customer per product:** Each customer has at most one active review per product. Submitting again for the same product is treated as an edit of the existing review.
- **BR-4 Editing:** A customer can change their rating and text at any time. Edited reviews show their last-updated date.
- **BR-5 Immediate publication:** New and edited reviews become visible immediately. There is no approval queue.
- **BR-6 Rating summary:** The product detail page shows the average rating (to one decimal place), the total number of ratings, and the count or share of ratings at each star level (5 down to 1). Only visible reviews count.
- **BR-7 Recent reviews:** The product detail page lists the most recent written reviews, newest first. Each shows the star rating, the reviewer's display name, the date, the review text, and a "Verified Purchase" indicator. Rating-only submissions count toward the summary but do not appear in the written-review list.
- **BR-8 Entry point to review:** On the product detail page, an eligible customer sees an option to write a review, or to edit their existing one. An ineligible signed-in customer sees a short explanation instead.
- **BR-9 Admin moderation:** Administrators can view all reviews (visible and hidden), hide a review, restore a hidden review, and permanently remove a review. Hidden and removed reviews disappear from customer view and from the rating summary.
- **BR-10 Access control:** Only the review's author can edit it. Only administrators can hide, restore, or remove reviews or see hidden reviews.
- **BR-11 Account deletion:** When a customer deletes their account, their reviews are removed and no longer count toward ratings.
- **BR-12 Empty state:** Products with no ratings show a clear "No reviews yet" state rather than a zero average.
- **BR-13 Reliability and consistency (non-functional):** Rating summaries always reflect the current set of visible reviews. Review features fail gracefully: if reviews cannot load, the rest of the product page still works.

## Acceptance criteria

1. Only verified purchasers may submit a review for a given product. A verified purchaser is a signed-in customer with at least one delivered order containing that product. Attempts by anyone else are rejected, even if they bypass the app screen.
2. Each customer may submit one review per product, with the ability to edit it. A second submission for the same product updates the existing review rather than creating a new one.
3. The product detail page displays the average rating, total review count, rating distribution, and recent reviews. Only visible reviews count, recent written reviews are shown newest first, and products with no ratings show an empty state.
4. Reviews display a "Verified Purchase" indicator.
5. Administrators can hide or remove reviews and toggle review visibility. Hiding is reversible and restoring returns the review to customer view. Removing is permanent. Neither hidden nor removed reviews count toward the rating summary.
6. A rating from 1 to 5 stars is required. Written text is optional, limited to 500 characters, and rating-only submissions count toward the summary but are not listed as written reviews.
7. New and edited reviews are visible to shoppers immediately after submission, without admin approval.

## Assumptions and constraints

- **PO decision (Q-1):** Reviews publish immediately, and moderation is reactive (hide, restore, or remove after publication).
- **PO decision (Q-2):** A star rating is required and written text is optional.
- **PO decision (Q-3):** Only orders that have reached the delivered stage make a customer a verified purchaser.
- **Sorting and filtering (Epic open question, decided by agent):** Out of scope for this release. Written reviews are shown newest first, which is enough to meet the "recent reviews" criterion. Sorting by rating can be added later without rework.
- Ratings are whole stars (1–5). The average is shown to one decimal place.
- Written review text is capped at 500 characters, which keeps it "short" as the Epic describes.
- Eligibility is checked when a review is submitted or edited. If an admin later moves an order back from delivered, existing reviews stay in place.
- If a hidden review is edited by its author, it stays hidden until an administrator restores it, so editing cannot be used to get around moderation.
- After an administrator permanently removes a review, the customer may submit a new one, because one review per customer applies to active reviews.
- Reviewer display names are shortened (first name and last initial) to protect customer privacy.
- Reviews are deleted when the reviewer's account is deleted.
- The product detail page shows a limited number of recent written reviews (around five). A full review list per product is not part of this release.
- Constraint: the existing order history already records which products a customer bought and each order's delivery stage, so verification relies on that data rather than any new purchase tracking.
- Constraint: the app talks to the backend only through the shared API client package, so new review operations must be added to that package before the app can use them.

## Dependencies

- **Backend service (ecommerce-backend-node-example):** must add review storage, the verified-purchase and one-per-customer rules, rating summaries, and admin moderation operations. This is the critical-path dependency and has no review capability today.
- **Shared API client package (easybuy-api-client):** must expose the new review and moderation operations and be released as a new version that the app then adopts.
- **Order data:** verification depends on order records keeping accurate product lists and delivered status, which administrators set through existing order management.
- **Local mock server:** should provide matching review behaviour, including at least one seeded delivered order, so the feature can be demonstrated and tested without the full backend.
- **Admin navigation:** the admin area needs a new entry point for review moderation alongside existing product, category, order, and user management.

## Risks

- **Fake or abusive content despite verification:** a genuine buyer could still post offensive text, and because publication is immediate it is briefly visible. Mitigation: reactive hide and remove tools, plus a text length cap. A future pre-publication filter can be added if abuse appears.
- **Low early review volume:** delivered-only eligibility and a young catalogue mean many products start with no reviews, which can look empty. Mitigation: a clear "No reviews yet" state, and allowing rating-only submissions to lower the effort of contributing.
- **Cross-repository delivery coordination:** the feature spans the backend, the API client package, and the app, so a delay in one blocks the others. Mitigation: deliver in sequence (backend, then client release, then app) with agreed contracts up front.
- **Misleading documentation:** project notes say reviews already exist on the backend, but they don't. Planning based on those notes would underestimate the work. Mitigation: this spec records the true starting point, and the notes should be corrected.
- **Rating accuracy and trust:** if hidden or removed reviews were still counted, or edits double-counted, the displayed average would be wrong and damage trust. Mitigation: acceptance criteria require summaries to reflect only visible, current reviews.
- **Privacy:** showing reviewer identities publicly could expose customer data. Mitigation: shortened display names and deletion of reviews along with the account.
- **Order status reversals:** an admin can change an order's status after a review exists, which may look inconsistent. Mitigation: documented rule that eligibility is checked at submission. Admins can still hide a review if needed.

## Open questions

No blocking questions remain. All three Epic open questions are settled: moderation and rating-only were decided by the PO, and sorting/filtering is deferred under Assumptions. Non-blocking items to confirm during Design:

- Should ratings later appear on product cards in browse and search lists? This is out of scope now and is a likely follow-up.
- Should customers be prompted to review after delivery, for example from order history? Not required by the Epic.
- Exact number of recent reviews shown on the product page (assumed around five).

## Initial implementation plan

- **Step 1 – Backend review capability:** add reviews to the backend service, covering storage, the delivered-purchase eligibility rule, one review per customer per product with editing, rating summaries that count only visible reviews, admin hide/restore/remove, and clean-up on account deletion.
- **Step 2 – Shared API client release:** add the customer review and admin moderation operations to the API client package and publish a new version.
- **Step 3 – Local mock server parity:** mirror the review behaviour and seed a delivered order so the feature can be demonstrated and tested locally.
- **Step 4 – Customer experience in the app:** adopt the new client version. Add the rating summary, star distribution, recent verified reviews, empty state, and write/edit review flow to the product detail page, with clear messaging for ineligible customers.
- **Step 5 – Admin moderation in the app:** add a review moderation screen to the admin area to list all reviews and hide, restore, or remove them.
- **Step 6 – Verification and documentation:** automated tests for eligibility, one-per-product editing, summary accuracy, and moderation effects. Correct the project notes that wrongly say review support already exists.

## Validation summary

This draft contains all twelve required sections with concrete content and no placeholders. It meets every blocking item in the alora.default.v1 Definition of Done. All five Epic acceptance criteria are preserved, and two more criteria capture the PO's decisions on rating-only submissions and immediate publication. The PO's answers to Q-1 (immediate publish with reactive moderation), Q-2 (rating required, text optional), and Q-3 (delivered orders only) are reflected throughout. The remaining Epic open question (sorting/filtering) is resolved as a recorded assumption. Codebase review confirmed reviews are net-new across the backend, API client, and app, and that existing order data supports the verification rule. No blocking warnings remain.