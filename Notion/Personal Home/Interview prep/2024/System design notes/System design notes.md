---

---


### Functional requirements

- Users should be able to ….
- Clients should be able to ….

### Non-functional requirements

- CAP tradeoff
- Scale to support x million DAU
    - Is horizontal scaling really necessary
- Read vs write ratio
- Latency less than x ms (p50, p90, p99)
- Burst traffic specific time of day or specific day of the year
- Is battery a problem if running on device
- Durability - is it okay to lose data
- Failover and recovery mechanisms
- Security

### API

- REST verbs (GET, POST, PUT, PATCH, DELETE)
- GraphQL
- RPC

### Data flow (Optional)

1. Fetch URLs
2. Crawl pages
3. Store in DB
4. Repeat step 1

### High level design

- Working functional requirements
- API gateway - request routing, rate limiting, load balancing, firewall, authentication
- Service - business logic
- Database w/ schema

### Dive deeps

- Which database to choose
    - SQL vs nosql
        - Key-val vs Column vs Document vs Graph DB
    - Read heavy vs write heavy
    - Single leader vs multi leader
    - Transactional vs analytical
    - Strong vs weak consistency 
        - Causal vs Read-your-own-writes vs eventual
    - In-memory vs persistent 
    - Which index to use
- Database internals
    - 2 phase locking
    - 2 phase commit
    - Distributed lock
    - LSM tree + SSTable vs B-trees
- Cache
    - Eviction policy
    - Invalidation policy
    - Cache write strategy
- Blob storage - S3
    - Durability, scalability, cost - best
    - Encryption at rest and in-transit
    - Chunking
    - CDN
- Queues
    - Message ordering
    - Guaranteed delivery vs Fire and forget
    - Retry mechanism
    - DLQ
    - Partitioning
    - Streams vs Queues vs PubSub
- Communication
    - REST vs GraphQL
    - REST vs long polling vs Sockets vs SSE
    - L4 vs L7 load balancer
    - Failure
        - Idempotency
        - Backoff
        - Circuit breaker
- Famous problems
    - Hotspot problem
    - Accuracy
    - Latency speed up
        - Multi-region datacenter
    - Large file size
- Security
    - Authentication
    - Encryption at transit and at rest
- Monitoring 
    - Infra monitoring - cpu, memory, dish, network usage
    - SLA monitoring- latency, throughput, error rate
    - App metric monitoring

### Doubts

- [x] When to use GraphQL
- [x] OSI layers for L4 and L7 load balancing

### Things to think about

| **Component** | **Key Metrics** | **Scale Triggers** |
| --- | --- | --- |
| **Caching** | - ~1 millisecond latency- 100k+ operations/second- Memory-bound (up to 1TB) | - Hit rate < 80%- Latency > 1ms- Memory usage > 80%- Cache churn/thrashing |
| **Databases** | - Up to 50k transactions/second- Sub-5ms read latency (cached)- 64 TiB+ storage capacity | - Write throughput > 10k TPS- Read latency > 5ms uncached- Geographic distribution needs |
| **App Servers** | - 100k+ concurrent connections- 8-64 cores @ 2-4 GHz- 64-512GB RAM standard, up to 2TB | - CPU > 70% utilization- Response latency > SLA- Connections near 100k/instance- Memory > 80% |
| **Message Queues** | - Up to 1 million msgs/sec per broker- Sub-5ms end-to-end latency- Up to 50TB storage | - Throughput near 800k msgs/sec- Partition count ~200k per cluster- Growing consumer lag |

Redis

- In memory 
- Single threaded
- Written in C
- Use cases: Cache, distributed lock store, sorted set for leaderboard, 

Kafka

- Message queue or streams
- Multiple brokers (server) - partitions (log files) - topics (logical groupings)
- Pull-based model for consumers

Cassandra

- Wide-column store - LWW - Various consistency levels - LSM tree + SSTable + WAL

Flink

- Source → Operators →stream → Sink
- Operators are stateful
- Watermark for processing order in a tumbling window 
- Checkpoint and periodic snapshots for exactly once processing 
- 

[[What happens why you type a URL on browser]]

Jeff dean number - [https://colin-scott.github.io/personal_website/research/interactive_latency.html?utm_source=chatgpt.com](https://colin-scott.github.io/personal_website/research/interactive_latency.html?utm_source=chatgpt.com)



- [ ] Reverse proxy
- [x] Read caching strategies
- [x] CDN for caching dynamic content
- [x] Different database types - pros and cons
- [x] Scaling memcache at facebook paper
- [x] GeoDNS
- [x] MessageQueues
- [x] DB normalization


Bit cask used in riak - everything is in memory - uses hash index of the key to position in file which is file offset - best for fast reads and writes - single threaded per log file

Riak - multi leader / leaderless replication 

Redis - in-memory database for caching - uses crdt for conflict resolution

Read committed isolation level (i.e. no dirty read and dirty write) - used in Oracle 11g, postgresql

Cassandra - leaderless replication - uses consistent hashing - read repair - anti-entropy (using merkle tree) - LWW - uses LSMTrees + SSTables internally in a single node - cluster key and sort key - wide-key store

DynamoDB - single leader replication - not based on dynamo paper

Dynamo system - key-value store - Amazon shopping cart - leaderless - eventually consistent - consistent hashing - sloppy quorum - hinted handoff - gossip protocol - vector clocks for conflict resolution 

VoltDB - actual serial execution - in-memory

Spanner - GPS clocks for precision - clock range and added waits for transactions

CouchDB uses btrees - document DB - doesn't write to page in-memory, but creates a new page and swaps the pointer at the end when committed

MongoDB - B-tree - single leader replication - almost same as SQL except document store instead of row store

apache parquet - columnar storage

HDFS - distributed computing framework - rack-aware storage - 1 name node & multiple data node - uses zookeeper for name node SPOF with WAL and distributed log replication

HBase - builds a DB on top of Hadoop - wide-key store - columnar storage

**Performance:**

- Binary size: Protobuf ≈ Thrift < Avro < JSON < XML
- Serialization speed: Protobuf and Thrift typically outperform Avro for small messages

**Schema Evolution:**

- Avro has the most robust schema evolution
- Protobuf handles it well with field numbering
- Thrift is similar to Protobuf

**Ecosystem Integration:**

- Protobuf: Strong integration with gRPC, Google Cloud
- Thrift: Originally from Facebook, used in some large-scale systems
- Avro: Well integrated with Hadoop ecosystem (Kafka, Spark, etc.)

**Use Case Considerations:**

- Need RPC framework too? Consider Thrift or Protobuf with gRPC
- Working with Hadoop/Kafka? Avro is well-integrated
- Mobile apps or resource-constrained environments? Protobuf is lightweight
- Need self-describing data? Avro embeds schemas



# Hello interview

- [x] GraphQL API vs REST API vs Wire protocol
- [x] Distributed lock
- [x] C++ string manipulation
- [x] Review resume
- [x] Setup C++ on Xcode
- [x] Learn libcurl APIs
- [x] Practice Whimsical and Excalidraw
- [x] Low-level design example
- [x] Paxos
- [x] Lamport clocks