# Homeland Jobs Mobile App - Day 6

Candidate: NJAJI SIBONA  
Candidate ID: HEH/DK1/010

## Overview

This is the Day 6 Mobile Development practical build for Homeland Ecosystem Hub. The project is an Expo React Native mobile app that implements a job feed, job detail screen, M-Pesa escrow simulation, bottom tab navigation, mock applications, messages, chat, and profile/theme switching.

## Tech Stack

- Expo
- React Native
- Local mock JSON data
- Component state for filters, navigation, payment state, and theme

## Setup

```bash
npm install
npm start
```

Then scan the Expo QR code using Expo Go on Android, or run:

```bash
npm run android
```

## Features Implemented

### Q28 - Job Feed Screen

- FlatList rendering 15 job cards from local mock JSON.
- Job cards show title, employer, avatar initial, category chip, budget, location, posted date, and skill tags.
- Pull-to-refresh simulates a 1.5 second reload.
- Search filters jobs locally as the user types.
- Bottom sheet filter panel opened from a floating Filters button.
- Category and location filters with Apply and Reset buttons.
- Skeleton loading state on first load.
- Tapping a job card opens a Job Detail screen.

### Q29 - M-Pesa Payment Simulation

- Job Detail screen has a Fund Escrow button.
- Payment modal shows amount, editable phone number, and Pay via M-Pesa button.
- Spinner appears for 2 seconds to simulate STK push.
- Success flow shows: Check your phone - M-Pesa prompt sent, then Escrow Funded Successfully with mock receipt.
- Failure toggle simulates insufficient funds and shows Retry button.
- Funded payment state is held in parent component state, so returning to the detail screen still shows funded status.

### Q30 - Bottom Tab Navigation

- Home tab: job feed.
- My Applications tab: 4 mock proposals with status badges.
- Messages tab: 3 mock conversations and a mock chat screen.
- Profile tab: name, skills, member since, total earnings, settings, and dark/light mode toggle.
- My Applications tab includes a hardcoded badge showing 2.

## AI Tools Used

ChatGPT was used for planning, code structure, documentation, and checking the solution against the assessment requirements. I reviewed the project and understand the implementation.

## Known Limitations

- Data is stored in local component state only.
- The payment flow is simulated and does not call a real backend or Safaricom Daraja API.
- The bottom tabs are custom-built with React Native state instead of a navigation library to keep the assessment build simple.
- The Expo QR code is generated when the project is run locally using `npm start`.
