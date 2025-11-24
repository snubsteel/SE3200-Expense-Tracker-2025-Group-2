## Overview
Our group has agreed to work on a budgeting module to enhance the expense tracker. This feature will compare user spending against the widely 
adopted 50/30/20 budgeting model, which allocates 50% of after-tax income to needs, 30% to wants, and 20% to savings. Users will input their income, 
and the system will calculate recommended budgets, then display how actual spending aligns with these targets in both currency and percentage terms.

## Problem Statement
Currently, the expense tracker records spending but provides limited analysis. Users lack meaningful insights to guide financial decisions. A budgeting 
module naturally pairs with the existing project and motivates users to record and improve their spending habits by following a proven financial framework.

## Proposed Solution
• Add budgeting section to existing application.  
• Add an income field for users to enter/update after-tax yearly income.  
• System calculates budgets for needs, wants, and savings based on entered income.  
• Expense categories gain attribute to denote need/want status, selected by user during category creation.  
• System queries annual expenses, calculates currency amount over/under budget and percentage over/under budget.  
• Savings are derived as income minus expenses from both needs and wants.  
• Budget report displays: calculated budgets for needs/wants/savings, user totals in needs/wants/savings, difference values between budgets and user totals.  

## Benefits
• Provides actionable insight to assist users, motivating users to track expenses consistently.  
• 50/30/20 framework helps user see the "big picture" in managing their finances.  
• Evolves the tracker into a personal finance tool.  
• Encourages healthier spending habits and long-term savings.  
• Increases user engagement and retention.  

## Implementation Notes
• Update "categories" database table to include attribute for need/want status.  
• Update category creation UI to prompt for need/want designation.  
• Budgets can be handled in one of two ways: store calculated budgets in a database table, or store income only and calculate budgets at runtime.  
