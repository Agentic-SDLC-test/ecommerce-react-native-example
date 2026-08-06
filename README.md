# React-Native Ecommerce App

# Hi, We are Team Charlie! 👋

[![Up to Date](https://github.com/ikatyang/emoji-cheat-sheet/workflows/Up%20to%20Date/badge.svg)](https://github.com/UsamaSarwar/reactnative-ecommerce-charlie)

## `Development Stack` ➡️ `MERN Stack`

### `Backend on NodeJs` ➡️ [https://github.com/abidrazaa/backend-node](https://github.com/abidrazaa/backend-node)

Open-Source React Native Ecommerce Cross Platform Mobile App :iphone:

## Mockups

<img align="left" alt="EasyBuy" src="image/easybuy.png" width="1000"/>

.


## Features :memo:

- [x] Stack Naviagtion
- [x] Splash Screen
- [x] Login Screen
- [x] Signup Screen
- [x] Forget Screen
- [x] User Profile Screen
- [x] My Account Screen
- [x] Update Password Screen
- [x] Admin Login
- [x] Admin Dashboard
- [x] Admin Add Product
- [x] Admin View Product
- [x] Admin Edit Product
- [x] Cart Screen
- [x] Checkout Screen

## Payments :credit_card:

Checkout offers the shopper a choice of payment method:

- **Cash on Delivery** — the default, and unchanged from before. Selected on
  first render, so a shopper who makes no active choice still checks out in one
  tap.
- **Card (simulated)** — a card placeholder screen that produces a payment
  outcome and hands it back to checkout.

**All payment in this app is simulated. No real money moves, and no card data is
ever collected.** The card number, expiry and CVC on the card screen are static
display text, not input fields — there is no field capable of accepting a real
card number, and the `/checkout` request body carries no card fields at all.

Every order records two payment facts, kept separate from the fulfilment
`status` (pending / shipped / delivered):

| `payment_status` | Shown to the shopper as | Meaning |
| ---------------- | ----------------------- | ------- |
| `due_on_delivery` | Pay on delivery | Cash order, or an order with no recorded payment |
| `paid` | Paid | A card payment was approved |
| `failed` | Payment failed | A card payment was declined |
| `not_completed` | Payment not completed | The shopper did not finish paying |

Advancing an order's fulfilment never changes its payment state, and payment
state is read-only in the staff views. Orders that predate this feature — and
orders from a backend that does not yet store these fields — display as Cash on
Delivery / Pay on delivery, never as paid.

### Payment feature flags

Both are build-time flags (Expo inlines `EXPO_PUBLIC_*` into the bundle, so a
change needs a rebuild). Neither is a secret. See `.env.example`.

| Flag | Default | Effect |
| ---- | ------- | ------ |
| `EXPO_PUBLIC_ENABLE_DIGITAL_PAYMENT` | on when unset | Set to `false` to offer cash on delivery only |
| `EXPO_PUBLIC_PAYMENT_SIM_CONTROLS` | on in dev only | Set to `true` to expose the Approve/Decline switch in a preview build |

## How to Run App :white_check_mark:

### `Clone the repo`

To clone this repo, type the following command

```
git clone https://github.com/UsamaSarwar/reactnative-ecommerce-charlie.git
```

### `Node Package Manager`

To install all the dependencies, use node package manager and run the command

```
npm i
```

### `npm start`

Runs your app in development mode.

Open it in the [Expo app](https://expo.io) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

Sometimes you may need to reset or clear the React Native packager's cache. To do so, you can pass the `--reset-cache` flag to the start script:

```
npm start -- --reset-cache
# or
yarn start -- --reset-cache
```

# v22.07.28

The demonstration of Signup flow and the flow of login from normal user and admin can be seen from [here](https://drive.google.com/drive/folders/1jnFENm2_fdwvpfrqEZxrqx9pOThvSMa3)

The demonstration of the app can be seen from [here](https://drive.google.com/drive/folders/1PNyGSzUDNxUtrmtVk9bp8Lp82INrSct-)

# Documentation

The complete documentation of the project i.e. Software Requirement Specifications, Technologies used can be seen from [here](https://docs.google.com/document/d/1I253JrdKuB3wEQxKVfp_DK8Kuxfb8WrvGbtDqrCsHEc)

The mockup designs of the application can be seen from [here](https://docs.google.com/presentation/d/1Imw0qHmIPhe_0FL_rpanTAoip-ps9dP-YuZRfTybnIM/edit#slide=id.gc6fa3c898_0_0)

# Presentation

The presentation of the Mockups can be seen from [here](https://www.youtube.com/watch?v=vgdUdXEXILA)

## Thanks to all the contributors ❤️

<a href = "https://github.com/UsamaSarwar/reactnative-ecommerce-charlie">
  <img src = "https://contrib.rocks/image?repo=UsamaSarwar/reactnative-ecommerce-charlie"/>
</a>
