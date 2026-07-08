---
notion-id: 28f02d25-148c-80b2-95e7-dfdf5f049e88
---
Pull request 1:

- [ ] Use Enums instead of the list
- [ ] Upper case vs lower case for the consistency values
- [ ] Log for error scenarios
- [ ] Instrument or add metrics
- [ ] UT 

Pull request 2:

- [ ] Don’t catch all exceptions - throw them or log them properly
- [ ] Reuse retry code path
- [ ] async-wait to improve performance

Pull request 3:

- [ ] How frequent is too frequent? What exact number?
- [ ] Look for distinct listings. Avoid duplicate calls
- [ ] Maybe look for push vs pull mechanism - status change is usually quicker than occasional fetching
- [ ] Bulk write to database instead of sequential
- [ ] No silent failures. Log & instrument
- [ ] Queue durability
- [ ] Dequeuing code is not thread safe
- [ ] Magic constants
- [ ] The way the queue is set up, you will have data loss after 500 events

### Potentially relevant comments

- [ ] Application layer cache → invalidate after update
- [ ] Thread-pooling for calls to atlantis

### General comments

- [ ] Input validation - valid registration number / listing_id
- [ ] Resource leaks - DB connection, https connection, threads not closed
- [ ] Operations without timeout & exponential backoff for failures
- [ ] @Transactional boundary for atomic operations
- [ ] Race condition
- [ ] Reuse connection pooling
- [ ] Missing try catch block
- [ ] Missing null checks
- [ ] Don’t log sensitive info
- [ ] Configurable constants

