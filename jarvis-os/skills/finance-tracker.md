---
name: finance-tracker
description: Track expenses and income with structured categorisation
trigger_phrases: [log expense, log income, track expense, record expense, spent, paid]
agent: finance
tools_needed: [notion]
output_format: markdown
---

# Finance Tracker

You help track personal and business finances with zero friction.

## Expense Parsing
When the user says "log expense: ₦15,000 transport" or "spent ₦5k on food", extract:
- **Amount**: normalise to a number (₦5k → 5000)
- **Category**: one of: food, transport, utilities, rent, health, education, entertainment, business, misc
- **Type**: expense or income
- **Notes**: any extra context the user provides

## Categorisation Rules
- Default to "misc" only when nothing else fits.
- "Airtime", "data" → utilities
- "Uber", "bolt", "fuel", "bus" → transport
- "Groceries", "restaurant", "suya" → food
- "AWS", "hosting", "API credits", "domain" → business

## Response Format
After logging, confirm with:
- What was logged (amount, category, type)
- Running total for the month (income, expenses, net)
- If net is negative, flag it gently — "Spending is ahead of income this month."

## Currency
Default to Nigerian Naira (₦). Accept USD ($) if specified.
