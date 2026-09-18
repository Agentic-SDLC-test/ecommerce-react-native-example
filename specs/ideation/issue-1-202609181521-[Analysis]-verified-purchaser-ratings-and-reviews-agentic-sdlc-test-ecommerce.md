# Business Spec: Verified Purchaser Ratings and Reviews (Agentic-SDLC-test/ecommerce-react-native-example#1)

> Jira Epic: [Agentic-SDLC-test/ecommerce-react-native-example#1](https://github.com/Agentic-SDLC-test/ecommerce-react-native-example/issues/1)
> Reporter: sushaanpatel-ibm · Story points: Not set
> Labels: epic

## Product summary

EasyBuy customers can already browse products, but shoppers have limited signal about product quality before buying. This feature lets customers who actually purchased and received a product leave a star rating and short written review, and shows the aggregate rating picture — average score, review volume, and the spread across 1–5 stars — on the product page. Restricting who can review to verified purchasers, and clearly labeling their reviews as "Verified Purchase," protects the credibility of that signal and reduces spam. Reviewers can also correct or update their own review later. Admins keep the ability to hide or remove any review that violates policy. The goal is higher shopper confidence and better conversion on the product detail page, and a cleaner moderation workflow for the admin team (Agentic-SDLC-test/ecommerce-react-native-example#1).

## Business problem

Shoppers browsing EasyBuy today have no way to see what other customers thought of a product before adding it to their cart — there is limited social proof on the product detail page. Where user-generated review content does exist, there is no guarantee it comes from someone who actually bought and received the item, which opens the door to spam or fabricated ratings that would undermine shopper trust the moment they were surfaced at scale. Agentic-SDLC-test/ecommerce-react-native-example#1 asks EasyBuy to let *verified purchasers only* rate and review products they bought, show the aggregated picture on the product page, and give admins lightweight moderation tools — so genuine buyer feedback becomes a trustworthy, visible part of the shopping experience.

## Goals and non-goals

- **Goal:** Let only customers who purchased and received a product submit a star rating and optional written review for it.
- **Goal:** Let a customer maintain a single review per product that they can revise after submitting it.
- **Goal:** Show shoppers an aggregate rating picture on the product page — average rating, total review count, the breakdown of ratings by star level, and the most recent reviews — each clearly marked when it comes from a verified purchaser.
- **Goal:** Give admins the ability to hide, restore, or permanently remove any review.
- **Non-goal:** Photo or video attachments on reviews.
- **Non-goal:** Voting on whether a review was "helpful."
- **Non-goal:** Threaded replies to reviews (from admins, sellers, or other shoppers).

## Personas and users

- **Verified purchaser (customer):** A registered shopper who has an order for the product marked as delivered. They can read the rating summary and reviews on any product, and can write, and later edit, one review for each product they've received.
- **Prospective shopper (any visitor):** Anyone viewing a product detail page, regardless of purchase history or login state, can see the average rating, review count, rating breakdown, and recent reviews — this already works today and is unaffected by this feature.
- **Store administrator:** Manages the catalog and now also moderates reviews — searching, hiding/showing, and deleting any review — through the existing admin review management screen.

## Business requirements

- **BR-1:** Only a customer with a delivered order that includes the product may submit a review for that product. *(Already enforced today — both the "Write a Review" action and the submission itself are gated on this.)*
- **BR-2:** A customer may hold at most one review per product. *(Already enforced today — a second submission for the same product is rejected.)*
- **BR-3 (new):** A customer who has already submitted a review for a product can edit that same review's rating and/or comment afterward, rather than being limited to a one-time submission.
- **BR-4 (new):** Every review a shopper sees carries a "Verified Purchase" indicator, so the distinction between a verified purchaser's review and any other feedback is visible at a glance, both to shoppers and to admins moderating reviews.
- **BR-5 (new):** The product detail page's rating summary shows, in addition to the average rating and total review count it already shows, a distribution of how many reviews fall at each star level (1 through 5).
- **BR-6:** The product detail page continues to show the most recent reviews for the product. *(Already in place today.)*
- **BR-7:** Admins can search for, hide/show, and permanently delete any review from the moderation screen. *(Already in place today.)*
- **BR-8 (pending PO decision — see Open questions):** Whether newly submitted reviews publish immediately (today's behavior) or are held for admin approval first, and whether a written comment is required or a rating alone is sufficient (today, a comment is optional).

## Acceptance criteria

1. Only verified purchasers may submit a review for a given product.
   - *Current state: already met — submission is blocked unless the customer has a delivered order containing the product.*
2. Each customer may submit one review per product, with the ability to edit it.
   - *Current state: partially met — the one-review-per-product limit is already enforced; the ability to edit an existing review is not yet available and is the main gap this feature closes.*
3. The product detail page displays the average rating, total review count, rating distribution, and recent reviews.
   - *Current state: partially met — average rating, total review count, and recent reviews already display; the rating distribution (breakdown by star level) does not yet exist and is a gap this feature closes.*
4. Reviews display a "Verified Purchase" indicator.
   - *Current state: not met — eligibility is checked at submission time but no verified-purchase label is stored or shown on any review today; this is a gap this feature closes.*
5. Administrators can hide or remove reviews and toggle review visibility.
   - *Current state: already met — the admin review management screen already supports hide/show toggling and permanent deletion.*

## Assumptions and constraints

- **Assumption:** "Verified purchaser" means the reviewing customer has at least one order for that product with a status of delivered (not merely placed or shipped). This is how eligibility already works today; the PO should confirm this is the right bar before it becomes a documented business rule rather than an implementation detail.
- **Assumption:** Editing a review does not require re-checking purchase eligibility (the purchase already happened) but does require the edit to come from the original reviewer.
- **Assumption:** An edited review keeps its original position in the "recent reviews" ordering (sorted by original submission date) rather than jumping to the top as newly active — flagged for PO confirmation if a different behavior is preferred.
- **Assumption:** If an admin has hidden a review, a subsequent edit by the customer does not automatically make it visible again; an admin must re-show it. This preserves the moderation decision through edits.
- **Constraint:** The moderation model (reactive vs. pre-publish approval) and the written-comment requirement are open questions in the source Epic; this draft assumes today's behavior (reviews publish immediately; a comment is optional) until the PO decides otherwise (see Open questions).

## Dependencies

- Depends on the store's existing order and delivery-status records to determine who counts as a verified purchaser — no new external system is required, but the "delivered" threshold needs PO sign-off (see Assumptions).
- Depends on the existing admin review-moderation screen as the place where the Verified Purchase indicator and any future approval workflow would also need to appear for admins.
- Depends on the existing product detail page's rating summary area, which this feature extends rather than replaces.
- No dependency on other teams, external services, or new infrastructure has been identified.

## Risks

- **Stale verification risk:** If a "Verified Purchase" label is fixed at the moment a review is written, a later order cancellation or return would not be reflected — a review could keep showing "Verified Purchase" after the purchase it was based on was reversed. Business impact: undermines the exact trust signal this feature exists to create. Mitigation: PO to confirm whether the badge should be a permanent record of "was verified at submission time" or continuously re-checked against current order status.
- **Moderation exposure window:** Under the current reactive model, a review is visible to every shopper the moment it's submitted, and only becomes hidden if an admin later notices and acts. Business impact: spammy or inappropriate content could be visible to shoppers for some period before removal. Mitigation: resolved by the PO's answer to the moderation-model open question below; reactive moderation is the interim default.
- **Edit-driven moderation bypass:** Allowing edits means a customer could rewrite a review's rating or text after an admin has evaluated it. Business impact: could quietly undo the intent of a prior moderation review if not scoped carefully. Mitigation: this draft assumes an edited review keeps any existing "hidden" state until an admin re-reviews it (see Assumptions).
- **Reduced usefulness at scale:** Without sort or filter controls, shoppers on high-volume products can only see the most recent reviews, not the highest- or lowest-rated ones. Business impact: the rating signal may be less actionable for purchase decisions than intended. Mitigation: resolved by the PO's answer to the sorting/filtering open question below; can also be treated as a fast-follow after initial launch.

## Open questions

- **Q-1 — Review moderation model:** Should a new review publish immediately and be moderated reactively (today's behavior), or should it require admin approval before shoppers can see it? See the accompanying clarifying question for proposed options.
- **Q-2 — Written comment requirement:** Should a customer be able to submit a rating with no written comment (today's behavior), or should a short written comment be mandatory? See the accompanying clarifying question for proposed options.
- **Q-3 — Review sorting and filtering:** Should shoppers be able to sort or filter the reviews shown on the product page (e.g., most recent, highest rated, lowest rated), or is showing them in recency order (today's behavior) enough for this release? See the accompanying clarifying question for proposed options.
- Should the "Verified Purchase" label be a permanent snapshot of eligibility at submission time, or should it be re-evaluated if the underlying order is later canceled or returned? (See the stale-verification risk above; not raised as a blocking clarifying question this turn, but should be settled before Design finalizes the data model.)

## Initial implementation plan

- Extend the review submission experience so a customer can revise their existing review for a product — the same rating and comment fields, now editable after the first submission — while keeping the one-review-per-product rule intact.
- Introduce a "Verified Purchase" indicator that is captured when a review is written and displayed wherever a review appears — on the product detail page and in the admin moderation screen.
- Extend the product detail page's rating summary to show a rating distribution (how many reviews fall at each star level) alongside the average rating, total count, and recent reviews it already shows.
- Confirm the moderation model and written-comment policy with the PO (Open questions Q-1 and Q-2) and adjust the submission and publication flow accordingly before this feature is considered final.
- Extend regression testing and admin-facing moderation checks to cover the new edit flow and the Verified Purchase indicator, alongside the existing submission and moderation checks.

## Validation summary

All twelve required sections are complete with concrete, non-placeholder content grounded in the current EasyBuy codebase: three of the five Epic acceptance criteria are already satisfied by existing functionality (verified-purchaser gating, one-review-per-product, and admin hide/remove/visibility controls), and this spec scopes the two genuine gaps — review editing and the "Verified Purchase" indicator — plus the rating-distribution addition to the existing rating summary. Three of the Epic's own open questions (moderation model, comment requirement, sorting/filtering) are raised as clarifying questions with proposed options rather than silently assumed, and working assumptions are recorded for anything needed to keep drafting rather than blocking on them. No blocking Definition of Done items are outstanding for this version; the PO's answers to Q-1–Q-3 will refine, but not block, the next iteration of this draft.