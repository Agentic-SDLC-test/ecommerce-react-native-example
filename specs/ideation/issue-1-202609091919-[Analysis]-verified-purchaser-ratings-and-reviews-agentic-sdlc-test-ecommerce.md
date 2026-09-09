# Business Spec: Verified Purchaser Ratings and Reviews (Agentic-SDLC-test/ecommerce-react-native-example#1)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#1](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/1)
> Reporter: sushaanpatel-ibm · Story points: _not set_
> Labels: epic

## Product summary

We want customers who have actually bought a product to rate it (1–5 stars) and leave a short written review, and we want shoppers browsing that product to see an at-a-glance summary of what buyers think — an average score, how many people reviewed it, how those scores break down across the five star levels, and the most recent reviews. Every review shown is backed by a real purchase, and a "Verified Purchase" label makes that trust visible. Lightweight admin moderation lets the team hide or remove anything inappropriate.

Importantly, much of this capability **already exists in the app today**: verified purchasers can submit a star rating and optional comment, the product page already shows an average score, a review count, and recent reviews, and admins already have a moderation screen to hide, show, or delete reviews. This Epic is best understood as **completing and hardening** that capability rather than building it from scratch. The remaining gaps are: letting a customer **edit** the single review they already left, adding the **rating distribution** breakdown to the product page, and surfacing an explicit **"Verified Purchase"** indicator on each review.

## Business problem

As described in Epic `Agentic-SDLC-test/ecommerce-react-native-example#1`, customer reviews increase buyer confidence and improve conversion, but only if shoppers trust them. Unrestricted reviews invite spam and fraudulent ratings that erode that trust. The Epic therefore asks that **only verified purchasers** be able to review a product, that each customer have **one editable review per product**, that the product page present a **rich ratings summary** (average, total count, distribution, recent reviews), that each review carry a **"Verified Purchase"** indicator, and that **administrators** be able to moderate reviews (hide, remove, toggle visibility).

The business opportunity is to close the trust loop: authentic, purchase-backed feedback that shoppers can rely on and that the team can keep clean with minimal effort. The current partial implementation already restricts reviews to verified purchasers, which is the hardest and most important guarantee — the remaining work makes that trust legible to shoppers and gives reviewers a way to correct or update their feedback.

## Goals and non-goals

- **Goal:** Ensure only customers with a completed (delivered) purchase of a product can submit a review for it — preserving the authenticity guarantee already in place.
- **Goal:** Allow each customer exactly one review per product, and let them **edit** that review after submitting it (the currently missing piece of this rule).
- **Goal:** On the product detail page, show the average rating, total review count, a **rating distribution** across the five star levels, and the most recent reviews.
- **Goal:** Display a clear **"Verified Purchase"** indicator on each review so shoppers can see the feedback is purchase-backed.
- **Goal:** Give administrators the ability to hide, show, and permanently remove reviews (already present; confirm it fully satisfies the moderation requirement).
- **Non-goal:** Photo and video reviews (explicitly out of scope per the Epic).
- **Non-goal:** Review helpfulness voting and replies to reviews (explicitly out of scope per the Epic).
- **Non-goal:** Reviewing products the customer has not purchased, or reviews from guests/unauthenticated users.

## Personas and users

- **Verified purchaser (customer):** A signed-in customer who has received a delivered order containing the product. They can write, view, and (new) edit their single review, and they read others' reviews and the ratings summary before buying.
- **Prospective shopper (customer):** Any customer viewing a product page. They consume the ratings summary and recent reviews to decide whether to buy; they cannot review a product they have not purchased.
- **Administrator:** An internal moderator who reviews submitted feedback and can hide, show, or remove individual reviews to keep content appropriate and trustworthy.

## Business requirements

- **BR-1 (Eligibility):** Only a signed-in customer with a delivered purchase of the product may submit a review for that product. Ineligible or unauthenticated users can read reviews but cannot submit. _Already enforced today._
- **BR-2 (One editable review):** Each customer may have at most one review per product and must be able to **edit** it (update the star rating and/or written comment) after submitting. _One-per-product is enforced today; editing is the gap to close._
- **BR-3 (Ratings summary):** The product detail page must display the average rating, the total number of reviews, a **distribution of ratings across the 1–5 star levels**, and the most recent reviews. _Average, count, and recent reviews exist today; the distribution breakdown is the gap to close._
- **BR-4 (Verified Purchase indicator):** Each displayed review must carry a visible "Verified Purchase" indicator. Because eligibility is already restricted to purchasers, every review qualifies — the requirement is to make this visible. _Not shown today; to be added._
- **BR-5 (Admin moderation):** Administrators must be able to hide a review, show a previously hidden review, and permanently remove a review. Hidden reviews must not appear to shoppers and must not count toward the public average, count, or distribution. _Present today; to be confirmed against the full requirement._
- **BR-6 (Written comment policy):** The written comment length limit already applied to submissions should be preserved, and the policy on whether a comment is required or optional must be confirmed (see Open questions).
- **BR-7 (Non-functional):** Changes must fit the app's existing role-based experience (customer vs. admin), work across the app's supported platforms, keep the ratings summary responsive on the product page, and remain compatible with the existing backend contract so the app continues to work against either the real backend or the local development server.

## Acceptance criteria

1. Only verified purchasers may submit a review for a given product.
2. Each customer may submit one review per product, with the ability to edit it.
3. The product detail page displays the average rating, total review count, rating distribution, and recent reviews.
4. Reviews display a "Verified Purchase" indicator.
5. Administrators can hide or remove reviews and toggle review visibility.

_Coverage assessment:_ AC-1 and AC-5 are met by the existing implementation and should be confirmed during delivery. AC-2 is partially met (one-per-product enforced) but requires new **edit** capability. AC-3 is partially met (average, count, recent reviews present) but requires the new **rating distribution**. AC-4 requires a new **"Verified Purchase" indicator** on each review. No AC is fully blocked; each gap is additive to working functionality.

## Assumptions and constraints

- **Assumption:** "Verified purchaser" means a customer whose order containing the product has reached a delivered/completed state — consistent with how eligibility is determined today. If the business intends a broader definition (e.g., any paid order regardless of delivery), that must be confirmed.
- **Assumption:** Because eligibility is already restricted to purchasers, every stored review is a verified purchase; the "Verified Purchase" indicator therefore applies to all displayed reviews rather than distinguishing a subset.
- **Assumption (pending confirmation):** New reviews are published immediately and moderated reactively (hidden/removed after the fact), matching current behavior. See Open questions Q-1.
- **Assumption (pending confirmation):** A written comment is optional; a rating-only submission is allowed, matching current behavior. See Open questions Q-2.
- **Assumption (pending confirmation):** For this release the product page shows reviews most-recent-first with no additional shopper-facing sort/filter controls, matching current behavior. See Open questions Q-3.
- **Constraint:** The app must keep working against both the production backend and the local development server through the same operation contract; any new capability (e.g., editing a review) must be reflected consistently on both.
- **Constraint:** Hidden or removed reviews must be excluded from the public average, count, and distribution so moderation actually protects shoppers.
- **Constraint:** Editing must respect the same eligibility and one-per-product rules, and the same comment-length limit, as initial submission.

## Dependencies

- **Order/fulfillment data:** Eligibility depends on knowing which customers have a delivered order containing the product; this relies on the existing order data and its delivered status.
- **Authentication/session:** Submitting and editing reviews depends on the existing sign-in and session mechanism to identify the customer and enforce eligibility.
- **Backend contract:** Adding review editing requires a corresponding backend operation on both the production backend and the local development server; delivery depends on that contract change being available on whichever backend is targeted.
- **Admin role/access:** Moderation depends on the existing admin role and the admin moderation experience.

## Risks

- **Edit abuse / rating manipulation:** Allowing edits could let a reviewer swing a rating after the fact. _Impact:_ distorted averages and reduced trust. _Mitigation:_ keep edits within the one-review-per-product rule, re-validate eligibility on edit, and recompute the summary from current review state.
- **Stale or inconsistent summary after moderation or edits:** If the average, count, or distribution are not recomputed when a review is edited, hidden, or removed, shoppers see misleading numbers. _Impact:_ erodes the trust the feature exists to build. _Mitigation:_ derive all summary figures from the current set of visible reviews.
- **Backend parity gap:** If the edit capability is added to one backend but not the other (production vs. development server), behavior diverges and testing is unreliable. _Impact:_ defects slip through and demos break. _Mitigation:_ implement the edit operation on both backends as part of the same change.
- **Trust dilution from a blanket "Verified Purchase" label:** Labeling every review "Verified Purchase" is accurate here but only meaningful if the eligibility guarantee genuinely holds. _Impact:_ if eligibility were ever loosened, the badge would mislead. _Mitigation:_ keep the badge tied to the actual eligibility rule, not applied unconditionally in the UI.
- **Moderation completeness:** If the moderation requirement implies more than hide/show/remove (e.g., approval queues), the current tools may fall short. _Impact:_ scope surprise late in delivery. _Mitigation:_ confirm the moderation model early (see Q-1).

## Open questions

- **Q-1 (Moderation model):** Should reviews require approval before they appear, or continue to publish immediately with reactive hide/remove moderation? _Current behavior: publish immediately, moderate reactively._
- **Q-2 (Written review requirement):** Is a written comment required, or is a rating-only submission acceptable? _Current behavior: comment optional (rating-only allowed)._
- **Q-3 (Sorting and filtering):** Should shoppers be able to sort or filter reviews (e.g., most recent, highest/lowest rated) on the product page, or is most-recent-first sufficient for this release? _Current behavior: most-recent-first, no shopper-facing controls._

No open question blocks progress: each has a working assumption recorded above so the rest of the spec is complete regardless of the answer.

## Initial implementation plan

- **Confirm what already works:** Validate the existing verified-purchaser gating, one-review-per-product enforcement, average/count/recent-reviews display, and admin hide/show/remove against the Epic's acceptance criteria, so effort focuses only on real gaps.
- **Add review editing:** Let a customer who has already reviewed a product update their rating and/or comment, reusing the same eligibility and comment-length rules, and reflect this on both the production backend and the development server.
- **Add the rating distribution:** Present, on the product detail page, how reviews break down across the five star levels alongside the existing average and count, computed only from reviews visible to shoppers.
- **Add the "Verified Purchase" indicator:** Show a clear label on each displayed review, tied to the eligibility guarantee.
- **Resolve the three open questions with the PO** (moderation model, written-review requirement, sort/filter scope) and adjust the above steps if the answers differ from the recorded assumptions.
- **Validate end to end:** Confirm all five acceptance criteria across the customer and admin experiences, including that hidden/removed and edited reviews are correctly reflected in the average, count, and distribution.

## Validation summary

All twelve required sections are present with concrete, PO-facing content. Every acceptance criterion from Epic `Agentic-SDLC-test/ecommerce-react-native-example#1` is preserved verbatim, with an explicit coverage assessment noting which are already satisfied and which require the additive work (review editing, rating distribution, and the "Verified Purchase" indicator). Ambiguities from the Epic's own "Open Questions" are surfaced as clarifying questions with recommended defaults grounded in current behavior; none block drafting. This draft satisfies the `alora.default.v1` Definition of Done. Remaining items are the three clarifying questions, which refine scope but do not gate advancement to Design.