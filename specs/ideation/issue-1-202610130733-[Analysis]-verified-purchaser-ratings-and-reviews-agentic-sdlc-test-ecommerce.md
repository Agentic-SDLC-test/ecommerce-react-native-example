# Business Spec: Verified Purchaser Ratings and Reviews (Agentic-SDLC-test/ecommerce-react-native-example#1)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#1](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/1)
> Reporter: sushaanpatel-ibm · Story points: Not estimated
> Labels: epic

## Product summary

EasyBuy customers who have received a product can give it a 1–5 star rating and, if they want, a short written review. They can also come back later and edit it. Each product page shows shoppers an overall picture of customer opinion: the average rating, the total number of reviews, a breakdown of how many reviews gave each star level, and the most recent reviews. Every review carries a "Verified Purchase" badge. Administrators keep control with lightweight, after-the-fact moderation: they can hide, show again, or permanently remove any review.

Much of this already exists in EasyBuy today. Customers with a delivered order can rate a product once. Reviews appear straight away, the product page shows the average, the count and the latest reviews, and admins can search, hide, show and delete reviews. This release closes the remaining gaps against the Epic:

- editing your own review
- the rating distribution
- a visible Verified Purchase badge
- clear rules for how editing interacts with moderation

The result: shoppers can trust what they read, and that trust helps them buy with confidence.

## Business problem

The Epic (Agentic-SDLC-test/ecommerce-react-native-example#1) states the motivation as follows: *"Customer reviews increase buyer confidence and improve conversion rates. Restricting submissions to verified purchasers ensures the authenticity of review content and reduces the incidence of spam and fraudulent ratings."*

The Epic summary asks to *"Enable verified purchasers to submit a star rating and a short written review for products they have purchased. Aggregate ratings and recent reviews will be displayed on the product detail page, supported by lightweight administrative moderation."*

Current gaps against that intent:

- **No way to correct or update a review.** A customer who changes their mind, for example after using the product longer, is stuck with their first rating. Stale or mistaken reviews erode trust.
- **Shoppers see only an average.** Without a star-level breakdown, a 3.0 average can't tell "consistently average" apart from "polarised". Shoppers lose context that drives purchase decisions.
- **Authenticity isn't visible.** Only verified purchasers can review today, but nothing on the review tells the shopper that. The trust benefit of verification is invisible.
- **Moderation edge cases are undefined.** Today a customer whose review was hidden can't post again, and nothing says what happens to an edited review that an admin hid earlier.

## Goals and non-goals

- **Goal:** Only customers who have received a product can rate and review it, and the review shows a Verified Purchase badge.
- **Goal:** One review per customer per product, which the customer can edit at any time.
- **Goal:** The product page shows the average rating, total review count, star-level rating distribution and most recent reviews.
- **Goal:** Reviews publish immediately (reactive moderation). Administrators can hide, re-show or permanently remove any review.
- **Goal:** A rating on its own is a valid review. Written text is optional, up to 500 characters.
- **Goal:** Keep the same behaviour in the local development environment and the production backend, so demos and testing match production.
- **Non-goal:** Approving reviews before they are published (PO decision: reactive moderation only).
- **Non-goal:** Customer-facing sorting or filtering of reviews (PO decision: most-recent order only; deferred to a later release).
- **Non-goal:** Photo and video reviews (Epic out of scope).
- **Non-goal:** Review helpfulness voting (Epic out of scope).
- **Non-goal:** Replies to reviews from the merchant or other customers (Epic out of scope).
- **Non-goal:** Customers deleting their own review (not requested; they can edit instead).
- **Non-goal:** Automated spam or profanity detection.

## Personas and users

- **Shopper (any visitor browsing products):** Reads the rating summary, distribution and recent reviews on the product page to decide whether to buy. Benefits from the Verified Purchase badge and the richer rating breakdown.
- **Verified purchaser (signed-in customer with a delivered order for the product):** Submits one rating with optional text, sees their own review, and can edit it later. Must clearly understand why they can or can't write a review.
- **Signed-in customer without a qualifying purchase:** Can read reviews but isn't offered the option to write one.
- **Administrator:** Moderates reviews from the admin area: searches reviews, hides inappropriate ones, shows them again, or removes them permanently. Needs to see edited content so moderation decisions stay informed.

## Business requirements

- **BR-1 — Verified purchaser eligibility:** A customer may review a product only if they have at least one order containing that product that has reached Delivered status. This keeps the existing eligibility rule. The system must enforce it on the server, not only by hiding the button in the app.
- **BR-2 — One review per customer per product:** A customer can hold at most one review for a given product. A second submission must be refused with a clear message, and the customer should be pointed to editing instead.
- **BR-3 — Rating and optional text:** A review needs a whole-number star rating from 1 to 5. Written text is optional and limited to 500 characters. A rating-only review is valid and counts toward the average and distribution.
- **BR-4 — Edit own review:** The author of a review can change its rating and text at any time, with the same rules as BR-3. Only the author can edit their review. An edited review shows an "Edited" indicator to shoppers.
- **BR-5 — Immediate publication:** New and edited reviews become visible to shoppers right away unless an administrator has hidden them. No approval step.
- **BR-6 — Edits never override moderation:** If an administrator has hidden a review, the author may still edit it, but it stays hidden until an administrator chooses to show it again.
- **BR-7 — Author visibility of own review:** On the product page, a customer always sees their own review, including whether it is currently hidden from other shoppers, so they understand why they can't post another.
- **BR-8 — Rating summary:** The product page shows the average rating (one decimal place, out of 5), the total number of reviews, and the number of reviews at each star level from 5 to 1. All three figures count only reviews currently visible to shoppers, and they update after a review is submitted, edited, hidden, shown or removed.
- **BR-9 — Recent reviews:** The product page lists the five most recent visible reviews, newest first by original submission date. Each shows the reviewer's first name and last initial, star rating, date, optional text, and the Verified Purchase badge. Products with no visible reviews show a friendly "no reviews yet" message.
- **BR-10 — Verified Purchase indicator:** Every review shown to shoppers carries a Verified Purchase badge. Because only verified purchasers can submit reviews, every review qualifies.
- **BR-11 — Clear entry points:** Eligible customers who haven't reviewed see a "Write a Review" action. Customers with an existing review see an "Edit your review" action. Everyone else sees neither.
- **BR-12 — Administrator moderation:** Administrators can view all reviews, visible and hidden, with product, reviewer, rating, text, visibility and edited status. They can search reviews, hide a review, show a hidden review again, and permanently delete a review after a confirmation step. Only administrators can perform these actions.
- **BR-13 — Removal frees the slot:** When an administrator permanently deletes a review, that customer may submit a new review for the product, provided they still meet BR-1.
- **BR-14 — Consistent behaviour across environments:** The local development environment and the production backend must both support every requirement above, so demos, testing and production behave the same.
- **BR-15 — Non-functional: trust and privacy:** Reviewer identity is shown only as first name and last initial. Ratings and text must be validated on the server so the rules can't be bypassed. Review screens must stay usable with assistive technologies, for example star ratings announced as "4 out of 5 stars".

## Acceptance criteria

1. **(Epic AC-1)** Only verified purchasers may submit a review for a given product.
   - A signed-in customer with a Delivered order containing the product can submit a review.
   - A customer without such an order is not offered the option, and an attempt to submit anyway is refused.
2. **(Epic AC-2)** Each customer may submit one review per product, with the ability to edit it.
   - A second submission for the same product is refused, and the customer is directed to edit.
   - The author can change rating and/or text. The change appears immediately and is marked "Edited".
   - A hidden review stays hidden after the author edits it.
3. **(Epic AC-3)** The product detail page displays the average rating, total review count, rating distribution, and recent reviews.
   - The average is shown to one decimal place out of 5, alongside the total count.
   - The distribution shows a count for each star level from 5 to 1.
   - The five most recent visible reviews are listed newest first.
   - Only visible reviews count, and all figures update after submit, edit, hide, show or delete.
4. **(Epic AC-4)** Reviews display a "Verified Purchase" indicator.
   - Every review shown on the product page carries the badge.
5. **(Epic AC-5)** Administrators can hide or remove reviews and toggle review visibility.
   - An administrator can hide a visible review and show a hidden one; hidden reviews disappear from the product page and from its summary figures.
   - An administrator can permanently delete a review after confirming. That customer may then review the product again.
   - Non-administrators can't perform these actions.
6. **(PO decision Q-1)** New and edited reviews publish immediately, with no approval step.
7. **(PO decision Q-2)** A review containing only a star rating, with no text, is accepted and counts in the summary figures. Text over 500 characters is refused.
8. **(PO decision Q-3)** Reviews appear in most-recent order only. No customer-facing sort or filter controls are offered in this release.
9. A customer always sees their own review on the product page, including a notice when it is hidden from other shoppers.

## Assumptions and constraints

- **Decision (Q-1):** Reactive moderation. Reviews publish immediately and administrators act after the fact. No approval queue.
- **Decision (Q-2):** Rating-only reviews are allowed. Text is optional, up to 500 characters, matching today's limit.
- **Decision (Q-3):** No sorting or filtering this release. Reviews show in most-recent order, and sorting is deferred.
- **Assumption:** "Verified purchaser" means the customer has at least one order for the product in Delivered status. Pending or shipped orders don't qualify. This matches today's rule.
- **Assumption:** Once a customer qualifies, the review stays even if the order situation changes later. EasyBuy has no returns or cancellations today, so there is nothing to revoke against.
- **Assumption:** All existing reviews were created through the verified-purchase check, so the badge can be shown on all of them without backfilling data.
- **Assumption:** The "most recent" order uses each review's original submission date. An edit doesn't move a review back to the top, which prevents bumping a review by editing it.
- **Assumption:** The product page keeps showing the five most recent reviews, as today. A "see all reviews" view isn't part of this release (see Open questions).
- **Assumption:** The average rating and distribution count only reviews visible to shoppers, consistent with today's average.
- **Assumption:** Reviews by customers who later delete their account stay published, displayed with the stored first name and last initial. This is consistent with current behaviour; see Risks for the privacy review.
- **Constraint:** Reviews are product-level. They aren't tied to a specific order or variant.
- **Constraint:** The mobile app (iOS, Android, web) is the only customer and admin channel. All changes must work on all three.
- **Constraint:** Out of scope per the Epic: photo/video reviews, helpfulness voting, replies.

## Dependencies

- **Production backend team / repository:** The separate EasyBuy backend service must deliver review editing, rating distribution, edited status and author-visible hidden status. It must also confirm that it enforces eligibility and the one-review rule. App release depends on this backend release.
- **Local mock environment:** The in-repo development API must be updated to match the production behaviour, so testing and demos aren't misleading.
- **Shared API client package:** If the separately published EasyBuy API client package is used by other consumers, it may need a matching update and release.
- **Order lifecycle:** Eligibility relies on administrators marking orders as Delivered. Reviews stay unavailable to customers until that happens.
- **App store / build pipeline:** Customer-visible changes ship through the normal staging build process for iOS and Android.

## Risks

- **Backend and local environment drift:** The production backend lives in a separate repository, and the local environment already behaves somewhat independently. If the two diverge, features may pass testing but fail in production. *Mitigation:* agree one shared behaviour contract during Design, then test both environments against the same acceptance criteria.
- **Eligibility enforced only in the app:** If only the app hides the button, motivated users could post fake reviews and undermine the authenticity goal. *Mitigation:* BR-1 requires server-side enforcement, and verification must include an attempt from an ineligible account.
- **Edits used to slip past moderation:** A customer could edit a hidden review hoping to republish abusive content. *Mitigation:* BR-6 keeps hidden reviews hidden after edits, and administrators see the edited status.
- **Reactive moderation exposure window:** Inappropriate content is visible until an admin notices it, which could cause brand or legal harm. *Mitigation:* accepted by the PO (Q-1). Admins already have search and one-tap hide; consider a periodic moderation routine.
- **Low review volume makes figures noisy:** With few delivered orders, averages and distributions may rest on one or two reviews and mislead shoppers. *Mitigation:* always show the review count next to the average and distribution.
- **Delivered-status dependency:** If admins don't mark orders as delivered promptly, genuine buyers can't review, reducing volume and frustrating customers. *Mitigation:* communicate the rule to admins; consider a reminder in the admin order workflow later.
- **Privacy of reviews from deleted accounts:** Keeping reviews after account deletion may conflict with data-protection expectations. *Mitigation:* the privacy owner confirms the policy during Design (see Open questions). Display already limits identity to first name and last initial.

## Open questions

None are blocking; each has a recorded default under Assumptions and constraints.

- Should reviews from customers who delete their account be removed, anonymised, or kept as today? Default: keep, showing first name and last initial. Owner: privacy/compliance.
- Should a "See all reviews" view be added for products with more than five reviews? Default: not in this release.
- Should administrators be notified when a hidden review is edited by its author? Default: no notification; edited status is visible in the admin review list.
- Should the Verified Purchase rule eventually account for returns or refunds if those are introduced? Default: not applicable today.

## Initial implementation plan

1. **Agree the review behaviour contract:** confirm with the backend team how editing, distribution, edited status and author-visible hidden status will work, so the app, production backend and local environment share one definition.
2. **Backend delivery:** extend the production backend's review capability with editing, the distribution figures and edited/hidden status for the author, and confirm server-side eligibility and one-per-product enforcement.
3. **Local environment parity:** bring the local development API to the same behaviour so testing and demos match production.
4. **Product page experience:**
   - add the star-level distribution and Verified Purchase badge
   - add the "Edited" indicator
   - add the author's own-review view with hidden notice
   - switch the review action between "Write a Review" and "Edit your review"
5. **Admin experience:** show edited status in the review moderation list, alongside the existing search, hide/show and delete-with-confirmation.
6. **Verification:** run every acceptance criterion against both environments, including attempts from ineligible accounts, duplicate submissions, editing a hidden review and deleting a review, plus accessibility checks of star ratings. Then ship through the staging build for iOS, Android and web.

## Validation summary

The draft passes all twelve blocking Definition of Done checks (alora.default.v1). Every required section is present with concrete content and no placeholders.

- All five Epic acceptance criteria are kept word for word and expanded into testable conditions.
- The three Epic open questions were settled by the PO: reactive moderation, rating-only allowed, and most-recent order only. They are recorded as decisions and acceptance criteria.
- The remaining questions are non-blocking, each with a recorded default.

The analysis is grounded in the current product. Verified eligibility, one-time submission, the average and count, recent reviews and admin moderation already exist. Editing, the distribution, the Verified Purchase badge and moderation-safe edit rules are new.

Caveat: the enterprise knowledge graph couldn't be searched in this run because the search tool isn't available here. Related ticket history and architecture standards weren't consulted and should be checked during Design.