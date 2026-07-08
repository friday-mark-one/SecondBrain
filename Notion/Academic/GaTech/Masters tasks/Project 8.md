---
notion-id: 13902d25-148c-8012-b9f9-d74be6b26601
base: "[[Masters tasks.base]]"
Status: ML4T - Fall '24
Assign: []
---
- [x] Benchmark end date identify properly
- [x] Benchmark commission and impact affected if sold at end
- [x] Can only trade the next day
- [x] Refactor strategy learner so it doesn’t waste time populating Y target twice
- [x] Refactor [testproject.py](http://testproject.py/) to not call training multiple times
- [x] Refactor plotting code to be generic
- [x] Things to tune
    - [x] Indicator
        - [x] Which indicator to use
        - [x] What it is returning
        - [x] Look-back period
        - [x] Include SPY in the calculation?
    - [x] Manual strategy limits for long and short conditions
    - [x] Learner
        - [x] Target Y computation
        - [x] Leaf size
        - [x] Bag size
        - [x] Different seed values

- [x] Manual strategy
    - [x] Start with one indicator
    - [x] Compare with plots each indicator 
    - [x] Identify limits for each one
    - [x] Loop on look-back period to find the optimal spot
- [x] Dont lookahead
- [x] Why no trades in the 2nd half of in-sample strategy learner?
- [x] Use SPY in the calculation?
- [x] Dropna in learner training
- [x] Vertical lines for LONG and SHORT entry points. Not buy and sell
- [x] Impact and commission in Strategy learner learning
- [x] Create a table
- [x] Fine tune bag size and leaf size so learner for JPM performs better and at the same time not breaking other tests
- [x] exp1 - what should be in it if everything is already done in testproject.py?
- [x] exp2
- [x] Report
- [x] Add comments in the code?

### To verify

- [x] grade strategy succeeds
- [x] Different seed values
- [x] testPolicy() should be much faster than add_evidence()
- [x] [testproject.py](http://testproject.py/) should run within 10 minutes
- [x] Everything in rubric
