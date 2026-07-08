---
notion-id: bf61be17-3b27-4235-9d84-741cf45f45b8
base: "[[Media.base]]"
Type: Book
Summary: ""
ASIN: ""
Author: []
---
# Part I. Foundation of data systems

### Chapter 1. Reliable, Scalable and Maintainable applications

- Many applications today are data-intensive as opposed to compute-intensive.
- Some of the commonly needed functionalities
    - Databases
    - Caches
    - Search indexes
    - Stream processing
    - Batch processing
- Reliability
    - Hardware faults
    - Software errors
    - Human errors
- Scalability
    - Load
    - Performance - response time, throughput
    - Scaling up (vertical scaling)
    - Scaling out (horizontal scaling)
- Maintainability
    - Operability
    - Simplicity
    - Evolvability

**Functional requirements** - allowing data to be stored, retrieved, searched and processed

**Non-functional requirements** - security, reliability, compliance, scalability, compatibility and maintainability

### Chapter 2. Data Models and Query Languages

**Relational model vs document model**

- SQL is an example of relational model where each relation is an unordered collection of tuples
- Network model and hierarchical model we used in 1980s

**Birth of NoSQL**

- Greater scalability
- Preference for FOSS
- No restrictions of relational schemas

NoSQL splits into document model and graph model both growing in opposite direction.

**The object-relation mismatch**

Object oriented programming vs SQL data model introduces *impedance mismatch.*

Object-Relation Mapping (ORM) takes care of this translation

For example, a resume can be represented as

- Multiple tables in Relational model
- Structured data types as XML
- Encode fields like education, job as a JSON and store it on a text column

**JSON**

Document oriented databases like [MongoDB](https://en.wikipedia.org/wiki/MongoDB), CouchDB, EspressoDB support storing data like resume (where JSON representation is quite appropriate).

- The lack of schema is a great advantage
- Better locality (compared to relational where you need to perform multiple messy joins)
- Suitable for data with one-to-many relationship

Many-to-one and many-to-many relationships do not fit the document model. To solve these problems, relational and network model were invented in the 1970s.

**The Network model**

The CODASYL committee standardized the model which is a generalization of hierarchical model.

- In hierarchical model, every record has exactly one parent whereas in the network model, a record could have multiple parents.
- Hence accessing records is like following a path.
- The problem was that updating the database was complicated and inflexible.

**Relational model**

Since data was out in the open with no complicated nested structures, and with [query optimizer](https://www.geeksforgeeks.org/query-optimization-in-relational-algebra/), it was easier to add new features to the application rather than worrying about the data model.

The problem with relational model usually is the schema flexibility and locality of data.

Document model enforces **schema-on-read** whereas the relation model enforces **schema-on-write**.

Although, Google’s Spanner database offers locality properties by allowing the schema to declare that a table’s rows should be [interleaved](https://cloud.google.com/spanner/docs/schema-and-data-model) (nested) within a parent table.

### **Query languages**

SQL is a declarative query language whereas IMS and CODASYL queried the database using imperative code.

A declarative language is attractive because it is typically more concise and easier to work with than an imperative API. More importantly, it hides implementation details of the database engine, which makes it possible for the database system to introduce performance improvements without requiring any changes to queries. It also lends to parallel execution unlike imperative languages where it is hard to parallelize because it specifies instructions that must be performed in a particular order.

**MapReduce querying**

It is a programming model for processing large amounts of data in bulk across many machines, popularized by Google. A limited form of MapReduce is supported by NoSQL datastores, including MongoDB and CouchDB, as a mechanism for performing read-only queries across many documents. Map - collect; Reduce - fold or inject

Query languages for Graph Data model - Cypher, SPARQL, Datalog

**Cypher** is a query language for property graphs for Neo4j graph databases.

**Triple-stores**- (subject, predicate, object) - (Jim, likes, bananas)

**SPARQL** - Query language using triple-stores for Semantic web. Predates Cypher.

**Datalog** - Predates all the above. Generalized version of triple-stores. Written as predicate(subject, object).

### Chapter 3. Storage and Retrieval

Transactional processing vs analytical processing

2 families of storage engine -

- log-structured storage engine
- page-oriented storage engine (B-trees)

Simple append-only log file storage has great write performance and poor read performance.

In order to efficiently find the value for a particular key in the database, we need a different data structure: an *index*. Well chosen indexes speed up read queries, but every index slows down writes.

**Hash Indexes**

Key-value data

Simplest possible indexing strategy: keep an in-memory hash map where every key is mapped to a byte offset in the data file. (Eg. Bitcask - but subject to the requirement that all the keys fit in the available RAM)

To avoid running out of disk space by adding to an append-only log, we break the log into segments of certain size by closing a segment file and making subsequent writes to a new segment file. We can then perform *compaction* on these segments in the background. In order to find the value for a key, we first check the most recent segment’s hashmap and then 2nd most recent and so on.

**Deletion:** To delete a key, a special deletion record called tombstone needs to be added. When log statements are merged, the tombstone tells the merging process to discard any previous values for the deleted key.

**Crash recovery:** If database is restarted, in-memory hash can be lost. It can be recovered by reading the segment files again and noting the offset (but it is a costly operation). Bitcask saves snapshot of the hash map to disk, so that it can be loaded into memory more quickly.

Append-only strategy works better than editing value in-place, because sequential write operations are faster than random access on disk-based magnetic drives and even on Solid State Drives (SSD).

**Limitations:**

- Hash table must fit in memory.
- Range queries are not very efficient.

**SSTables and LSM-Trees**

Using the same log file for storage, we require that the sequence of key-value pairs are sorted by key. This is called Sorted String Table or SSTable.

- With this change, merging segments is simple and efficient (like a merge sort algorithm)
- All keys need not be stored as an index. One key for every few kilobytes of segment file is sufficient.
1. When a write comes in, it is added to an in-memory balanced tree data structure (AVL / red-black) - this is called memtable.
2. When memtable gets bigger, write it out to disk as an SSTable file. This becomes the most recent segment file. Meanwhile, writing can continue on new memtable instance.
3. To serve a read request, check in memtable, then in recent segment, then in older and so on.
4. In background, run a merging and compaction process periodically.
5. To avoid loss during crash, the values are appended to a separate log file, from which it can be restored.
6. This can be slower when searching for keys that do not exist. In order to optimize this, storage engines often use additional Bloom Filters.

This indexing structure was described under the name Log-Structured Merge Tree (LSM-Tree)

Lucene, used by Elasticsearch and Solr, users a similar method for storing its term dictionary.

**B-Trees**

This is the most widely used indexing structure. B-Trees are similar to SSTables where we keep key-value pairs sorted by key. But by contrast, B-trees break the database into fixed-size blocks or pages (like 4 KB). Each page can be identified using an address, which allows one page to refer to another. This can be used to construct a tree of references. There is a root and each child is responsible for a range of keys. Eventually we go down to a page containing individual keys (a leaf page). Branching factor is typically several hundred.

To update a key, the leaf page containing the key is updated.

To insert a key, we follow down to the node encompassing the page and add it to the page. If there isn’t enough space, it is split into two half-full pages, and the parent page is updated to account for the new subdivision. This ensures that the tree remains balanced.

For example, A 4-level tree of 4KB pages with a branching factor of 500 can store up to 256 TB.

**Optimizations**

- In order to avoid crashes, B-tree implementations include a write-ahead log (WAL) - an append-only log.
- Instead of overwriting pages and maintaining a WAL for crash recovery, some databases use a copy-on-write scheme. A modified page is written to a different location and the new version of the parent tree is pointing to the new location.
- We can save space in pages by not storing the entire key, but abbreviating it. Especially in the interior of the tree, keys only need to provide enough information to act as boundaries between key ranges.
- Leaf pages can be laid out in disk in sequential order to reduce disk seek time. But this often becomes difficult as the tree grows in size.
- Have sibling pointers that can ease up speed instead of going to the parent node (useful for range queries).

**Comparing B-tree and LSM trees**

As a rule of thumb, LSM-trees are typically faster for writes, whereas B-trees are thought to be faster for reads.

Advantages of LSM trees

- A B-tree index must write every piece of data at least twice: once to the WAL and to the tree page. Some implementations write to the page twice to avoid inconsistency during crash. This is known as write-amplification. This effect is less in LSM-trees.
- LSM-trees can be compressed better, whereas B-trees often have partially filled pages due to fragmentation.

Downsides of LSM trees

- Compaction process in LSM trees can sometimes interfere with the performance of ongoing reads and writes. It can be really pronouncing at high percentiles.
- If write throughput is high and compaction is not configured carefully, it can happen that the compaction cannot keep up with the rate of incoming writes.
- An advantage of B-tree is that each key exists in exactly one place in the index and is easier to acquire lock over a range of keys.

**Other indexing structures**

All key-value structures described usually form the primary index. It is also very common to have secondary indexes.

In these key-value structure, the value can be stored in 2 ways

7. Storing the actual row
8. Reference to the row stored in *heap file*

It is efficient to store using the 2nd method, so that updates to values can happen in-place without any change to the indexes. When the value cannot be stored within the same storage, all indexes need to be updated. Or an optimization could be to have a forwarding pointer in the old heap location pointing to the new location, so that indexes need not change.

Sometimes hopping between references can be an overhead. So it may be desirable to store the indexed row directly as value within an index (ie. 1st way mentioned above). This is known as clustered index.

A compromise between a clustered index and a non-clustered index is known as covering index.

**Multi-column index**

Most common type is called a concatenated index which combines several fields into one key by appending. A standard B-tree or LSM tree index is not able to answer multi-column query efficiently.

**Full-text search and fuzzy indexes**

All the above allows only for exact match and no fuzzy match. Example, Lucene does fuzzy match using SSTable-like structure for its term dictionary. The in-memory index is a finite state automaton over the characters in the keys, similar to trie. This automaton can be transformed to Levenshtein automaton.

**Keeping everything in memory**

All the indexes discussed so far have the limitations of disk space. Some stores are are intended for caching use-only, where it’s acceptable for data to be lost if a machine is restarted.

Advantages of in-memory stores

9. It can avoid the overheads of encoding in-memory data structures in a form that can be written into a disk.
10. Provide in-memory data models that are difficult to implement with disk-based indexes. Eg. Redis offers a database-like interface to various data structures such as priority queues and sets.
11. This in-memory model can be virtually extended to infinite memory by having only recently used blocks in-memory when there is not enough space in RAM. This is better than what OS does with swapping pages, because databases works at granularity of individual records.

**Transaction processing vs Analytics**

Earlier, companies used SQL which provided flexibility to support both Online Transaction Processing (OLTP) and Online Analytic Processing (OLAP). But companies started to run analytics on a separate database instead. Called as a *data warehouse.*

**Data warehousing**

The process of getting data into the warehouse is known as Extract-Transform-Load (ETL). The indexing algorithms discussed above does not perform well for analytical queries.

Amazon Redshift is a hosted version of ParAccel.

**Schemas for analytics**

**Stars and snowflakes**

At the center of the schema is the so-called fact table. Each row in the table represents an event. Some columns represent attributes, while some columns are foreign key references to other tables called dimensions table. This is called star schema.

A variation of this is known as the snowflake schema where dimensions are further broken down into subdimensions.

**Column-Oriented Storage**

Often analytical queries require results only from few of the several columns. Instead of fetching the entire row from memory to parse and then filter, a column-oriented storage stores all the value from each column together, which can save a lot of work. But this storage relies on each column files containing the rows in the same order.

**Column compression**

Column values are quite repetitive, which is a good sign for compression. One particular technique that is effective in data warehouse is *bitmap encoding*. Often, the number of distinct values in a column is small. If the bitmap is very sparse, it can be additionally run-length encoded which can be very compact.

**Vectorized processing** Column-oriented storage layouts are also good for CPU cycles. A chunk of compressed column data can comfortably fit into an L1 cache and iterate through it in a tight loop (i.e. with no function calls). Operators such as bitwise AND and OR can be designed to operate on such chunks of compressed column data directly. THis technique is known as vectorized processing.

**Sort order in columnar storage**

It is easiest to store them in the order in which they were inserted, since inserting a new row just means appending to each of the column files. However, we can also do like SSTables, but not sort them independently because the row index would no longer match with other columns. For example, sorting by date_key and then the second sort order by product_sk. Another advantage of sorted order is that it can help with compression of column (since sorted column will have long sequences of same repeating values).

**Several different sort orders**

It is a clever extension to have data replicated (to not lose data) and also to have different sort order in each replication. And a query can use the version that best fits.

**Writing to column-oriented storage**

If you wanted to insert a row in the middle of a sorted table, you would have to rewrite all the column files. This can be optimized by using LSM-trees. All write first go to an in-memory store, where they are added to a sorted structure and prepared for writing to disk when accumulated to a certain threshold. This is essentially what Vertica does. Query optimizer takes care of this abstraction by first checking in-memory store and then checking column files.

**Aggregation: Data cubes and materialized views**

While traditional row-oriented databases and few other architectures are used, columnar storage is rapidly gaining popularity. Analytical queries often use aggregate functions like SUM, AVG, MAX, MIN, COUNT. These can be cached using something called materialized view. The difference between a standard view is that, materialized view is an actual copy of the query results, written to disk. When you read form a virtual view, the SQL engine expands it into the view’s underlying query on the fly and then processes the expanded query.

When the underlying data changes, the materialized view needs to be updated. This can make writes more costly, which is why it is not usually used in transactional processing and makes more sense in read-heavy data warehouse.

A special case of a materialized view is known as a data cube or OLAP cube. It like having aggregate along each row and column of a two dimensional-table. An advantage of this is that, queries become very fast because they have effectively become precomputed.

### Chapter 4. Encoding and Evolution

Updating schemas as application evolves. Backward compatibility vs Forward compatibility. In server side, a rolling upgrade can be provided by updating few nodes, checking its stability and later updating all nodes. But the client side is at the mercy of the user, hence both new and old version of data will co-exist.

Representational State Transfer (REST)

**Formats for encoding data**

12. In memory, data kept in objects, structs, list, etc.
13. When writing data to file or send it over network, it needs to be encoded to some kind of self-contained sequence of bytes (eg. a JSON). This translation between in-memory representation to a byte sequence is called *encoding* (serialization) and the reverse is called decoding (deserialization).

Language-specific formats

- Java - Serializable
- Ruby - Marshal
- Python - pickle

Problem with these is that

- they are not operable across languages.
- Versioning with forward and backward compatibility.
- Efficiency - java’s serializable is poor and bloated.

Standardized encoding formats - JSON, XML, CSV

- These formats are human readable.
- But they are also often criticized. XML is too verbose.
- CSV is popular but less powerful
- XML and CSV cannot distinguish between a number and a string
- JSON cannot distinguish between int and float (or precision level in float)

**Binary encoding**

Since JSON uses a lot of space compared to binary formats, it led to the development of binary encodings of JSON like BSON, BJSON, MessagePack, but not very widely adopted.

**Thrift and Protocol Buffers**

Both of these require a schema for any data that is encoded. They also come with a code generation tool that takes a schema definition and produces classes that implement the schema in various programming languages.

Thrift has two different binary formats. 1) Binary protocol 2) Compact protocol

**BinaryProtocol** is similar to binary json encoding except that instead of encoding field names, it uses field tags (like aliases

**CompactProtocol** is equivalent to BinaryProtocol, but very compact. It does this by packing field type and tag number into a single byte, and by using variable-length integers.

**Protocol buffers** are very similar to CompactProtocol, except it does bin packing differently and more compact than all the above. - [https://developers.google.com/protocol-buffers/docs/cpptutorial](https://developers.google.com/protocol-buffers/docs/cpptutorial)

With schema evolution,

- If a field value is not set, it is simply omitted from the encoded record.
- You can change the name of a field but no the field tag
- Add new fields provided a new tag number is assigned.
- New field cannot be made required, because it breaks backward compatibility
- Old required fields cannot be deleted.
- Data types can be changed but at the risk of truncation. Eg 64-bit field changed to 32-bit

**Avro**

Another encoding similar to protobuf, but more efficient and compact. Dynamic schema generation.

**Modes of dataflow**

- Databases
- Services: REST and RPC
- Asynchronous message passing

A **service** usually represents a client server architecture, using GET/POST requests for communicating data. Moreover, the server can itself be a client to another service. This way of building applications has traditionally been called Service-Oriented Architecture (SOA) and more recently rebranded as microservices architecture.

When HTTP is used as an underlying protocol for talking to the service, it is called a web service. There are two popular approaches to web services: REST and SOAP.

**REST** is not a protocol, but rather a design philosophy that builds upon the principles of HTTP. It emphasizes simple data formats, using URLs for identifying resources and using HTTP features for cache control, authentication, and content type negotiation. An API designed according to the rules of REST is called *RESTful*.

**SOAP** is an XML based protocol. It avoids using HTTP features. The API of SOAP web service is described using an XML-basesd language called the Web Service Description Language (WSDL). WSDL enables code generation, useful for statically typed languages.

**RPC** tries to make a request to a remote network service look the same as calling a function or method in your programming language. But it suffers some serious problems

- A network request is unpredictable.
- It may return without a result, as opposed to local calls which return a result, throws an exception or never returns (infinite loop case)
- Retry a failed network request where previous request actually got through but only the response was lost.
- Much slower than a function call
- Need encoding into sequence of bytes instead of just passing pointers.
- Client and service may be on different programming language and may need translation for data types handled by the RPC framework.

**Message passing dataflow**

It is between RPC and databases. It uses an intermediary called a message broker.

- It can act as a buffer if recipient is unavailable or overloaded
- Automatically redeliver message to a crashed process
- Abstracts IP and port from sender
- One message to multiple clients
- Decouples sender from the recepient

Communication is 1-way. Since it is asynchronous, sender doesnt wait or expect reply. In general message brokers are used as follows: one process sends a message to a named queue or topic, and the broker ensures that the message is delivered to one or more consumers of or subscribers to that queue or topic. There can be many producers and consumers on the same topic. (all are one-way data flow).

# Part II. Distributed Data

- Scalability
- Fault tolerance
- Latency

**Scaling to higher load**

- Buying more powerful machine (vertical scaling or scaling up)
- Shared memory architecture
- Shared disk architecture
- Shared-nothing architecture (horizontal scaling or scaling out)
    - Replication
    - Partitioning

### Chapter 5. Replication

Replication means keeping a copy of the same data on multiple machines.

- To keep data geographically closer to users
- To allow system to continue working even if some parts have failed.
- To scale out number of machines that can serve read queries

3 ways to do replication

- Single-leader
- Multi-leader
- Leaderless

Other configurations

- Synchronous vs asynchronous

**Leaders and followers**

Also known as master-slave configuration.

14. One of the replicas is designated as leader. Write requests are sent to the leader, which first writes to its local storage.
15. Leader sends a replication log to all followers.
16. Read requests can be queried either to the leader or any other followers.

**Synchronous vs Asynchronous replication**

Sending an ACK to a client after the follower is updated is called synchronous replication. If the leader doesn’t wait, it is called asynchronous replication.

The advantage of synchronous replication is that the follower is guaranteed to have the up-to-date copy of the data that is consistent with the leader. The disadvantage is that if the synchronous follower doesn’t respond (due to any failures), all writes are blocked. In practice, if the synchronous follower becomes slow or unavailable, one of the asynchronous follower is made synchronous. This guarantees that data is up-to-date with at least one of the follower. This configuration is sometimes called semi-synchronous.

Often, leader-based replication is configured to be completely asynchronous.

**Setting up new followers**

17. Take a consistent snapshot of the database at some point in time (if possible without taking a lock on the entire database).
18. Copy the snapshot to the new follower.
19. The follower connects to the leader and requests all data changes that have happened since the snapshot was taken. This snapshot is associated with an exact position in the leader’s replication log. Called log sequence number in PostgreSQL.
20. Now the follower is caught-up and can continue receiving continuous updates from the leader.

**Handling node outage**

- Follower failure: **Catch-up recovery**
    - Each follower keeps log of the data changes it has received from the leader. If a follower crashes / disconnected, it knows the last transaction received from the leader. When it comes back online, it can catch-up with the leader from the last transaction log and then continue its normal operation.
- Leader failure: **Failover**
    - One of the followers needs to be promoted to be the new leader, clients need to be reconfigured to send their writes to the new leader, followers need to starting consuming data from the new leader. This process is called failover.
21. Detect if a leader has failed (periodic ping with timeout of 30 seconds).
22. A new leader can be chosen by an election process or appointed by a previously elected controller node.
23. Reconfiguring the system to use the new leader. Clients sending to new leader. Old leader should step down as a follower and follow the new leader.
- **Risks in failover**
    - If asynchronous replication is used, not all writes from the old leader may have reached the new leader. What should happen to those writes? The most common solution is for the old leader’s unreplicated writes to be discarded.
    - Can be risk when old leader comes up causing a *split-brain*
    - What is the right timeout before the leader is declared dead?

**Implementation of replication logs**

- **Statement-based replication**
    - In the simplest case, the leader logs every write request.
    - Non-deterministic functions such as NOW() and RAND() will vary.
    - Auto incrementing columns should be executed in the same order.
    - This can be worked around by replacing those calls with a fixed return value when the statement is logged so that the followers all get the same value.
    - Because of these many edge cases, other replication methods are preferred.
- **Write-ahead log (WAL) shipping**
    - Similar to SSTables and B-trees, besides writing the append-only logs to disk, the leader also sends it across the network to its followers.
    - This method of replication is used in PostgreSQL among others.
    - Since WAL contains details of which bytes were changed in which disk blocks (tightly coupled to the storage engine), it is typically not possible to run different versions of database software on the leader and the follower.
- **Logical (row-based) log replication**
    - An alternative is to use different log formats for replication and for the storage engine, which allows log to be decoupled from the storage engine internals.
    - A logical log for the relational database is usually a sequence of records describing writes to database tables at the granularity of row.
        - For insert, log contains new value for all columns
        - For delete, enough information to uniquely identify the row (eg. primary key or all values of the deleted column)
        - For update, similar to delete with old and new values
    - If a transaction modifies several rows, several such log records are generated.
- **Trigger-based replication**
    - If you want to replicate only a subset of the data, then you may need to move replication up the application layer.

**Problems with replication lag**

For workloads that consists of mostly read requests and small percentage of writes, create many followers. In this read-scaling architecture, it realistically works only with asynchronous replication (With synchronous, single node failure would make the entire system unavailable). Unfortunately, if an application reads from an asynchronous follower, it may see out-dated information if the follower has fallen behind. But after a while, all the replicas will be in a consistent state. This is known as *eventual consistency*. In normal operation, the delay between a write happening on the leader and being reflected on a follower is called the *replication lag*.

- **Reading your own writes**
    - The writes go through the leader, but when read it can be read from a follower.
    - In this situation, we need read-after-write consistency also known as read-your-writes consistency. This guarantees that if the user reloads the page, they will always see any updates they submitted themselves and makes no promise about other users.
    - Techniques to achieve this
        - When reading something the same user modified, read it from the leader; otherwise from a follower.
        - If all the user edits need to read from leader, it negates the benefit of read scaling. In that case, track the time of the last update and serve for 1 minutes from the leader.
        - The client can remember the timestamp of the most recent write, check with replica to see if it is updated. If not check with other replica or wait for the replica to catch up with the leader.
    - Another complication is when same user is accessing your service from multiple devices. In this case you want to provide cross-device read-after-write consistency.
        - In this case, the most recent write metadata from one device has to be centralized.
        - If the devices are in different geographic regions, you may need to route all of a user’s devices to the same datacenter.
- **Monotonic reads**
    - When a user reads another user’s new comment from one replica and when read again from a different replica where the comment is not yet updated, the user feels like the comment was deleted or moving back in time.
    - One way of achieving monotonic reads is to make sure that each user always makes their reads from the same replica (the replica can be chosen based on the hash of the user ID).
    - However, if the replica fails, the user’s queries will need to be rerouted to another replica.
- **Consistent prefix reads**
    - An answer should come after the question. For eg, the following is in wrong order
        - Mrs. Cake: About ten seconds usually, Mr. Poons.
        - Mr. Poons: How far into the future can you see, Mrs. Cake?
    - There is causal dependency between these 2 sentences.
    - If a sequence of writes happen in a certain order, then anyone reading those writes will see them appear in the same order.
    - This however is a problem in partitioned databases.
    - One solution is to make sure that any writes that are causally related to each other are written to the same partition.

**Multi-Leader replication**

Multi-leader configuration doesn’t make sense in a single datacenter. Each datacenter’s leader replicates its changes to the leaders in other datacenters. Advantages include improved write performance for multi-geographic datacenters, tolerance of datacenter outages, tolerance of network problems.

A big downside is that same data may be concurrently modified in two different datacenters and those write conflicts must be resolved as “conflict resolution”. Auto incrementing keys, triggers, integrity constraints is often considered dangerous territory that should be avoided if possible.

**Clients with offline operation**

Calendar app where you make write requests, it is stored in the phone’s storage (local leader) and there is an asynchronous multi-leader replication between the replicas of your calendar on all your devices.

**Collaborative editing**

Eg. Google docs - similar to a calendar application above. To avoid conflicts, a user must obtain a lock on the document. However, for faster collaboration, you may want to make the unit of change very small (Eg. a single keystroke) and avoid locking.

**Handling write conflicts**

24. Conflict avoidance
    1. In an application where a user can edit their own data, you can ensure that requests from a particular user are always routed to the same datacenter.
25. Converging towards a consistent state
    2. In one datacenter, the title is changed from A -> B -> C. In another datacenter, it is received as A -> C -> B. No order is more correct than the other. To avoid this inconsistency, all replicas must arrive at the same final value. To achieve this
        1. Give each write a unique ID (eg, a timestamp, a long random number, a hash of the key and value) and pick the write with the highest ID as the winner. Also known as last write wins (LWW). But this is dangerously prone to data losses. This is the only supported feature in Cassandra (which follows leaderless replication)
        2. Give each replica a unique ID and let write that originated at a higher-numbered replica win. Also implies data loss.
        3. Somehow merge them together, like order alphabetically.
        4. Record the conflict in an explicit data structure and let application code resolve the conflict some time later.
26. Custom conflict resolution logic
    3. On write - when a conflict occurs
    4. On read - when a conflicted portion of the data is read.

**Multi-leader replication topology**

- Circular topology
- Star topology
- All-to-all topology

Circular and Star topology have single-point of failure. Although they can be worked around, it is often manual. All-to-all topology does not have this problem, but they have other problems where network speeds at different link cause some message to overtake others causing inconsistencies.

**Leaderless replication**

Amazon used it for its in-house Dynamo system (note that DynamoDB uses single-leader replication and is different from the Dynamo paper 2007). Write requests are sent to multiple replicas. Even if there is a node failure, it can be configured that at least ⅔rd of the replicas logged success. Similarly reads should be requested from more than one replicas because a particular replica would’ve just come online with some data lost during its downtime and trying to catch up. Hence, clients will get multiple results for the same query from different replicas. This is resolved by looking at the version number from each result and pick the latest one.

A failed node can catch up in 2 ways:

- **Read repair**
    - When a client finds multiple results from multiple replicas, it writes back the latest result to the replica that sent the old value.
- **Anti-entropy process**
    - Some datastores have a background process that constantly look for differences in data replicas and copies any missing data from one another.

**Quorums for reading and writing**

If there are n nodes, every write must be confirmed by w nodes, query at least r nodes for each read. As long as w + r > n (this makes sure there is an overlap between w and r), we expect to get an up-to-date value when reading. Typically, n is an odd number (say 3 or 5) and w = r = (n+1)/2. Although quorums minimize the probability of stale reads, it is not completely avoided. Issues like monotonous reads, read-your-writes are still a problem and there is no guarantee.

**Monitoring staleness** of replicated nodes (like replication lag in single-leader replication) is quite difficult in leaderless replication. Because there is no fixed order in which writes are applied.

**Sloppy quorums and Hinted handoffs**

Sometimes a client cannot reach the r nodes where the value usually resides. Is it better to return errors to all requests for which we cannot reach a quorum? (OR) Accept writes anyway and write them to some nodes that are reachable but aren’t among the usual n nodes. The latter is known as **sloppy quorum**. These temp proxy nodes can handoff the new values to the usual “home” nodes as soon as they are online. This is known as **Hinted handoff.**

In the shopping cart example, we saw 2 clients concurrently adding items to cart, and how version based tracking of items helped converge to a unified result. When this is done on multiple replicas, we get a **version vector**.

### Chapter 6. Partition

For very large datasets or very high throughput, replication is not sufficient. We need to break the data up into **partitions** also known as **sharding**. Thus a large dataset can be distributed across many disks, and the query load can be distributed across many processors. Large, complex queries can potentially be parallelized across many nodes, although this gets significantly harder.

Partitioning is usually combined with replication so that copies of each partition are stored on multiple nodes. A node may store more than one partition.

A leader-follower partition model looks as follows

![](https://lh7-us.googleusercontent.com/PQpfSj8CuxNkTWdD3CyQxyCLVEg1AlL0Wl2jIOXXfJX-rLvQ7nkPB2GaPbaMwmS-WHQkVb_AJWSWR_3Z7w8B_5nkkaTddTYq4rV97-ApLYWM7DZD3ce9qef7LCHnDkw_jaBsmFVmFoqyq4Y28SyA7w)

Everything discussed in Replication applies to replication of partitions.

**Partitioning of Key-Value data**

Our goal with partitioning is to spread the data and the query load evenly across nodes. A partition with a disproportionately high load is called a hotspot. The simplest approach for avoiding hotspots would be to assign records to nodes randomly. That would distribute the data quite evenly across the nodes. But when querying you don’t know which data is where, so all nodes need to be queried parallely.

**Partitioning by key range**

Like alphabetical ordering of encyclopedia titles. The ranges of keys are not necessarily evenly spaced, because your data may not be evenly distributed. Titles starting with U,V,W,X,Y,Z maybe less compared to A or B. In order to distribute the data evenly, the partition boundary needs to adapt to the data. (discussed more in **Rebalancing Partitions**). Within each partition we can keep the keys in sorted order. Consider an application where the key is timestamp, then all the keys for a particular day are stored in a single partition. The downside of this is that a particular node is overloaded with writes while others sit idle. To avoid this problem, we could prefix timestamp data with sensor name so that the partitioning is first by sensor name and then by time.

**Partitioning by Hash of key**

To avoid skews and hotspots, many distributed datastores use a hash function to determine the partition for a given key. Eg. MongoDB uses MD5, Cassandra uses Murmur3, etc. Hash functions of programming languages cannot be used because they return different values for the same string in different processes. Unfortunately, we lose a nice property of key-range partitioning: the ability to do efficient range queries.

Cassandra achieves a compromise between the two partitioning strategies. A table in Cassandra can be declared with a compound primary key consisting of several columns. Only the first part of that key is hashed to determine the partition, but the other columns are used as a concatenated index for storing the data.

**Skewed workloads and relieving hotspots**

On a social network, a celebrity user with millions of followers may cause a storm of activity resulting in a large volume of writes to the same key. Today, most systems are not able to automatically compensate for such a highly skewed workload, so it’s the responsibility of the application to reduce the skew. For eg. if one key is very hot, a simple technique is to add a random number as a prefix or suffix to the key. This needs to be done only for hot keys and book keeping needed for identifying these keys when querying.

**Partitioning and secondary indexes**

All the above depends on key-value for primary indexes. A secondary index doesn’t identify a record, rather a way of searching for occurrences of a particular value. (eg. find all cars whose color is red). The problem with secondary indexes is that they don’t map neatly to partitions. There are 2 main approaches.

**Document-based partitioning**

Whenever a red car is added to the database, the database partition automatically adds it to the list of document IDs for the index entry *‘color:red -> [191, 306]*’. Each partition maintains its own secondary indexes, covering only the documents in that partition. For this reason, it is also known as local index.

However, since red cars can be in any partition, a read query must be sent to all nodes. Though this is prone to be a costly operation, it is widely used in MongoDB, Riak, Cassandra, etc.

**Term-based partitioning**

Rather than each partition having its own secondary index, we can construct a global index that covers data in all partitions. However, the global index stored in a single node defeats the purpose of partitioning and hence the global index must also be partitioned but should be done differently from primary partition. All colors starting with a to r can be stored in one partition and s to z in another partition. As before, we can partition the index by the term itself, or using a hash of the term. Term will give good results for range query, whereas hash will give good load distribution. A term-based partitioning makes read queries more faster. However, the downside is that the writes are slower and complicated. In practice, updates to global secondary indexes are often asynchronous. Amazon’s DynamoDB works this way.

**Rebalancing partitions**

Over time the following things may happen

- Query throughput increases
- Dataset size increases
- A machine fails

All of these changes call for data to be moved from one node to another. No matter which partitioning scheme, rebalancing is usually expected to meet some minimum requirements

- After rebalancing, the load should be shared fairly distributed between the nodes in the cluster.
- Database should continue accepting read and writes while rebalancing.
- No more data than necessary should be moved between nodes

**Strategies for rebalancing**

Hash % N is not a way. Because if N changes as a result of adding more nodes to the cluster, all the modulo value may change and need to be moved.

**Fixed number of partitions**

Create many more partitions than there are nodes and assign several partitions to each node. Now if a node is added to the cluster, the new node can steal a few partitions from every existing node until partitions are fairly distributed once again. If a node is removed from cluster, the same happens in reverse. During this rebalancing, the old nodes are still used for live reads and writes. You can also assign more partitions to nodes that are more powerful. We have to choose the right amount of partitions and fix it beforehand. If the number is too large, rebalancing and recovery from failure nodes become expensive. If too small, it incurs too much overhead.

**Dynamic partition**

For databases that use key-range partitioning: if the boundaries are configured wrong, all the data may end up in a single partition. For this reason, databases such as HBase and RethinkDB creates partitions dynamically. When a partition grows a configured size, it is split into 2 partitions. Similarly, if it goes below a threshold, it gets merged (Similar to what happens in B-trees at the top level). An advantage of dynamic partitions is that the number of partitioning adapts to the total data volume. A preconfigured number of nodes are initially created and split known as *presplitting* to avoid read and write overhead on a single machine.

In both the above cases, the number of nodes is fixed and it does not change based on the dataset. Cassandra uses a third option, where the number of nodes increases with dataset to keep the number of partitions and partitions size fairly stable.

**Request routing**

How does a client know which IP/port to use because of this partition and rebalancing? This is an instance of a more general problem called ***service discovery***. There are some approaches.

- Allow the client to contact any node, if lucky handle the request, else forward the request to appropriate node.
- Send all requests to a routing tier first which determines which node should handle.
- Require that the clients be aware of the partitioning and assignment of partition nodes.

In all these cases, the problem is how does the component making the routing decision learn about the changes of the assignment of partition to nodes? Many distributed data systems rely on a separate coordination service such as ZooKeeper to keep track of this cluster metadata. The partition-aware client can register itself with the ZooKeeper to know what all changed. LinkedIn’s Espresso uses Helix for cluster management (which in turn uses ZooKeeper).

Cassandra and Riak take a different approach called **gossip protocol**. Requests can be sent to any node and that node forwards them to the appropriate node for the requested partition.

**Parallel Query Execution**

Massively Parallel Processing (MPP) often used for analytics are much more sophisticated in the types of queries they support. (more detailed in Chapter 10).

### Chapter 7. Transactions

In the harsh reality of data systems, many things can go wrong.

- Hardware or software problems
- Application crash
- Network interruption
- Concurrency problems

For decades, *transactions* have been the mechanism of choice for simplifying these issues. It is a way to group several reads and writes into one logical unit.

The safety guarantees are often described by acronym **ACID**

*Atomicity, Consistency, Isolation, Durability*

Basically Available, Soft State and Eventual Consistency (**BASE**)

**Atomicity**

The ability to abort a transaction on error and have all writes from that transaction discarded is the defining feature of atomicity.

**Consistency**

Consistency refers to an application specific notion of the database being in a “good state”. Hence, this is more of a responsibility of an application rather than the database.

**Isolation**

Concurrently executing transactions are isolated from each other (*serializability*)

**Durability**

It is a promise that once a transaction has committed successfully, any data it has written will not be forgotten, even if there is a hardware fault.

**Single-object writes**

When writing a 20 KB JSON document to a database, when there is a network interruption or a parallel read, will the data get corrupted / spliced or show partial update?

Atomicity can be implemented using a log for crash recovery and isolation can be implemented by obtaining a lock on each object. Similarly popular is a compare-and-set operation, which allows a write to happen only if the value has not been concurrently changed by someone else.

**Handling errors and aborts**

A key feature of transaction is that it can aborted and safely retried if an error occurred. ACID databases are based on this philosophy. But not all systems follow it though. In particular, datastores with leader-less replication work much more on a “best effort” basis. So its the application’s responsibility to recover from errors.

- If a transaction succeeded, but the network failed while server tried to acknowledge, client may perform the operation twice, unless there is an application-level deduplication.
- If error is due to overload, retrying is going to make it worse. Using exponential backoff will help
- It is only worth retrying after transient errors
- If the client process fails while retrying, any data it was trying to write to the database is lost.

**Weak Isolation levels**

If 2 transactions don’t touch each other, they can be safely run in parallel. Concurrency issues only come when 2 transactions read and write or write and write the same data. Hence databases have tried to provide transaction isolation. *Serializable isolation* means transactions have the same effect as if they ran serially, although this has a huge performance cost. It is therefore common for systems to use weaker levels of isolation, which protect against some concurrency issues, but not all.

**Read Committed**

27. When reading from the database, you will only see data that has been committed. (no dirty read)
28. When writing to the database, you will only overwrite data that has been committed. (no dirty writes)

This is the most popular isolation level, by default in Oracle 11g, PostgreSQL, MemSQL, etc. Most commonly databases prevent dirty writes by using row-level locks. It must hold-on to that lock until the transaction is committed or aborted.

Similarly to avoid dirty reads, briefly acquire the lock and release it after reading. However, the approach does not work in practice, because one long running write transaction can force many other read transactions to wait. Hence most databases avoid read lock. Since the database contain both new and old values during a write lock, any read request is served with the old value.

**Snapshot isolation and Repeatable Read**

Read committed still has issue - when Alice arranges a transfer of 100$ from one of her savings account to another, and if she tries to read both account balance at unlucky times, she may see 100$ deducted from one account and nothing added to another account. This anomaly is called *read skew*. This is not a lasting problem because it is going to look consistent in the next read. But there are some situations that cannot tolerate such temporary inconsistency like when a write occurs during a long running analytical query or during a backup.

*Snapshot isolation* is the most common solution to this problem. The idea is that each transaction reads from a consistent snapshot of the database. Snapshot isolation is a popular feature supported in PostgreSQL, MySQL with InnoDB storage engine, SQL Server, etc.

**Implementing snapshot isolation**

A key principle of snapshot isolation is readers never block writers and writers never block readers. The database must potentially keep several different committed versions of an object, because various in-progress transactions may need to see the state of the database at different points in time. Because it maintains several versions of an object side by side, this technique is known as *multi-version concurrency control* (MVCC).

A typical approach is that read commit uses a separate snapshot for each query, while snapshot isolation uses the same snapshot for an entire transaction.

**Indexes and snapshot isolation**

One option is to have the index simply point to all versions of an object and require an index query to filter out any object versions that are not visible to the current transaction.

Another approach is used in CouchDB. Although they use B-trees, they use an append-only variant that instead of overwriting pages create a new copy of each modified page. The tree is updated till the root to point to the new version.

**Preventing lost updates**

Example, two users concurrently incrementing the counter or 2 users editing a wiki page at the same time.

**Atomic write operations**

Atomic operations are usually implemented by taking an exclusive lock on the object when it is read so that no other transaction can read it until the update has been applied. Another option is to force all atomic operations to be executed on a single thread. This may work well for counter increment problem, but does not solve the parallel wiki editing problem.

**Explicit locking**

Sometimes the atomic operations on the database don’t provide the necessary functionality. The application can perform a read-modify-write cycle, and other concurrent transactions are forced to wait until the cycle has completed.

**Automatically detecting lost updates**

Allow the transactions to happen parallely and let the transaction manager detect any lost update. If so, abort the transaction and force it to retry its read-modify-write cycle. This can be performed efficiently in conjunction with snapshot isolation.

**Compare and set**

The purpose of this operation is to avoid lost updates by allowing an update to happen only if the value has not changed since you last read it. If changed, the read-modify-write cycle is retired.

**Conflict resolution and replication**

In replicated databases, preventing lost updates takes on another dimension: since they have copies of data on multiple nodes, and the data can potentially be modified concurrently on different nodes, some additional steps need to be taken to prevent lost updates. Thus techniques based on lock or compare-and-set do not apply in this context.

A common approach in such replicated databases is to allow concurrent writes to create several conflicting versions of a value (known as *siblings*), and to use application code or special data structures to resolve and merge these versions.

Atomic operations work well in replicated contexts if they are commutative (apply them in different order on each replicas and still get the same result).

**Write skew and Phantoms**

Previous sections discussed about 2 of the effects of race conditions when concurrent transactions execute. However that is not the end of the list. Write skew is the generalization of lost updates. Consider an oncall schedule for doctors which requires at least one doctor be an oncall at a given shift. When the last 2 doctors decides to take off from oncall at the same time thinking that the other doctor is available. Now the shift does not have an oncall at all. Here different transactions affect different objects (Dr. Alice and Dr. Bob). If both transactions were to update the same object, you get a dirty write or lost update anomaly.

- Atomic single-object operations don’t help as multiple objects are involved.
- Automatic detection of lost updates doesn’t help.
- Some database allows you to configure constraints which are then enforced by the database. (eg. uniqueness, foreign key constraints, or restrictions on a particular value). We can implement this for multi-object operations with the help of triggers or materialized views.
- If you can’t use serializable isolation level, the 2nd best option is *Explicit lock* on the rows that the transaction depends on.

Other practical examples of read skew includes

- Meeting room booking system
- Multiplayer game where 2 users moving different characters to the same position that violates the rules of the game.
- Claiming a username on a website (saved by unique constraint on the column)
- Preventing double-spending

**Phantoms causing write skews**

Explicit locking discussed as the 2nd best option above sometimes does not give the correct result. We use SELECT query to identify the rows that needs modification and acquire a lock over it with FOR UPDATE clause. But when we want to use the SELECT result to verify that no rows are present based on a WHERE condition, and the next INSERT statement adds that value, there is no possibility of acquiring a lock over such rows. This problem in known as *phantom*.

**Materializing conflicts**

To solve phantoms, consider the meeting room booking issue, you could imagine creating a table of time slots to a particular room or a particular period of time (say 15 minutes). You create rows for all possible combinations of rooms and time periods ahead of time (say for next 6 months).

Now a transaction that wants to create a booking can lock the rows in the table that correspond to the desired room and period. Note that this table is purely used as a collection of locks and not used to store other information. This approach is called materializing conflicts. Unfortunately, this can be hard and error-prone to figure out how to materialize conflicts. Hence, this should be considered as a last resort if no alternative is possible.

**Serializability**

- Literally executing transactions in serial order
- Two-phase locking which for several decades was the only viable option.
- Optimistic concurrency control techniques such as serializable snapshot isolation

**Actual serial execution**

Execute in serial order in a single thread. Recently engineers decided that a single threaded loop for executing transactions was feasible. If multi-threaded concurrency was required for good performance, why change to make single-threaded execution possible?

29. RAM became cheap enough that many use cases became feasible to keep the entire active dataset in memory.
30. DB engineers realized that OLTP transactions are usually short and only make a small number of reads and writes. (By contrast, analytical queries are read-only, so they can be run on a consistent snapshot).

However the throughput is limited to that of a single-core CPU.

**Encapsulating transactions in stored procedures**

Consider airline booking. It is a multistage process (search for routes, available seats, deciding on an itinerary, entering passenger details, making payment). Since humans are very slow to respond and DBE thought it would be neat to have a single transaction for the entire process. Instead of allowing single threaded multi-statement transactions, the application must submit the entire transaction code to the database ahead of time, as a *stored procedure*.

Although, they have gained some bad reputation over the years for the following reason:

- Each database has its own language for stored procedures (oracle has PL/SQL, SQL server has T-SQL, PostgreSQL has PL/pgSQL). These languages haven’t kept up with developments in general-purpose programming languages.
- Code running in a database is difficult to manage - to keep in version control, deploy, test, integrate with metrics collection system.
- A database is much more performance-sensitive than an application server.

However these issues can be overcome. Modern implementations of stored procedure use general purpose programming languages.

**Partitioning**

Since a single CPU cannot handle heavy write operations, data can be partitioned to multiple CPU cores so that throughput can be scaled linearly.

**Summary of serial execution**

- Every transaction must be small and fast.
- It is limited to use cases where the active dataset can fit in memory.
- Write throughput must be low enough to be handled by a single CPU core or else transactions need to be partitioned without requiring cross-partition coordination.
- Cross-partition transactions are possible, but there is a hard limit to the extent to which they can be used.

**Two-phase Locking (2PL)**

2PL is stricter than just locking the shared object.

31. If A has read an object and B must write to that object, then B must wait for A.
32. If A has written an object and B wants to read that object, then B must wait for A.

i.e . writers just don’t block other writers, they block other readers as well.

This is in contradiction to Snapshot isolation, which has the mantra - “Readers never block writers, and writers never block readers.

Thus 2PL solves all race conditions including lost update and write skew.

2PL uses shared lock for reads, where multiple transactions can hold the same shared lock. Exclusive locks are held by write transactions. A shared lock can be converted to exclusive lock. 2PL gets its name because 1st phase involves acquiring the lock and the 2nd phase involves releasing the locks.

2PL has performance problems for obvious reasons and may cause deadlock very frequently (although such deadlocks are detected and aborted so that application layer can handle any retries)

**Predicate locks**

Considering meeting room booking scenario,

SELECT * FROM bookings

WHERE room_id = 123

AND end_time > ‘2018-01-01 12:00’

AND start_time < ‘2018-01-01 13:00’;

Rather than lock belonging to a particular object, it belongs to all objects that match some search conditions. The key idea here is that a predicate lock applies even to objects that do not yet exist in the database (for queries with INSERT operation), but which might be added in the future (phantoms).

**Index range locks**

This is a simplified approximation of predicate lock. Predicate lock is also a little slower since it has the search for any matching locks. Index range lock is a superset of predicate lock. I.e. block all rooms from 12 to 1PM or block room 123 for full day.

**Serializable Snapshot Isolation (SSI)**

SSI is an upgrade over snapshot isolation. It is the best of weak isolation (for performance) and serialization (for no concurrency issues). The database checks whether anything bad has happened. If so, the transaction is aborted and has to be retried. All reads within a transaction are made from a consistent snapshot of the database + algorithm for detecting serialization conflicts among writes and determining which transactions to abort.

**Decisions based on outdated premise**

In the doctor oncall example, when a doctor reads the database before write, the premise was that there was another doctor available. Premise change between last read and current write. So there are 2 cases to consider.

33. Detecting stale MVCC reads
    1. In doctor’s oncall case, if 2nd doctor reads from a snapshot when the 1st doctor’s transaction is not committed. This causal dependency must be detected and 2nd doctor must be notified that the premise has changed.

![](https://lh7-us.googleusercontent.com/GTWRucy3IiMJrl-Yu5-7JAGXnO9AtYLWQhq5px0TT9omOnacXeEUYTGHRoD6ElsqDZ0Mc-dFIKdXthsMixMlgyBsme7dYCQZ_ou0g6qs3DMWNNZwKdS8o5yca-ZilaWbcTbYxhlrA40ifPx869josQ)

34. Detecting writes that affect prior reads
    1. Similar to index range locks in 2PL. Keep a table of whoever has read a particular key (shift_id = 1234). When someone writes, the lock acts as a tripwire. Look at Figure 7.11 for more clarity.

![](https://lh7-us.googleusercontent.com/lYIfVuuiB0Ssbfr8ZExNdW2SEk0BVLbSBEXxzNTRK2y3NhXByibkhciJkAwjbAbr71rCWU45bV9CK7PKaMyjzZv-yCGDBxLbJ02YYfv3nQabOEIAdTA21ngmOp55Y-Rol6220JZiLEZkYxD5NPBbMQ)

The rate of abort significantly determines the overall performance of SSI.

### Chapter 8. The Trouble with Distributed Systems

The previous chapters have been slightly optimistic even with the things that we thought that can go wrong. This chapter reaches the max level of pessimism.

**Faults and Partial failures**

- Power Distribution Unit (PDB) failure
- Switch failures
- Accidental power cycles of whole racks
- Whole-DC backbone failures
- DC’s HVAC (Heating, Ventilating and Air Conditioning system) failure

**Cloud computing and Supercomputing**

- At one end of the field of high-performance computing (HPC). Supercomputers with thousands of CPUs.
- At the other extreme is cloud computing with commodity computers, elastic/on-demand resource allocation and metered billing.
- Traditional enterprise datacenters lie somewhere between these extremes.

With these philosophies come very different approaches to handling faults.

In a supercomputer, a job typically checkpoints the state of its computation to durable storage from time to time. If one node fails, stop the entire cluster, repair the faulty node and restart from last checkpoint. So a supercomputer deals with partial failure by escalating into total failure.

But in internet services where latency is an important factor:

- Stopping the cluster for repair is not acceptable.
- While supercomputers are built with specialized hardware, nodes in cloud services are commodity machines which can provide equivalent performance but also have higher failure rates.
- The bigger a system gets, the more likely it is that one of its components is broken.
- In a geographically distributed deployment, communication most likely goes over the internet which is slow and unreliable compared to local networks of supercomputers.

**Unreliable networks**

In a shared-nothing architecture where all informations are communicated through networks, there are several reasons why a response to a request may not be received. It is impossible to distinguish the reason for no response. It can be

- Request is lost
- Waiting in a queue
- Remote node failed
- Remote node temporarily stopped responding (maybe because of a long pause on garbage collection)
- Response is lost
- Response is delayed and delivered later

Only way to handle this problem is to have a timeout assuming a network issue.

Telephone networks provide more reliability than internet networks because the former uses circuit-switched network while the latter uses packet-switched network.

In circuit-switched network, a fixed bandwidth is allocated for the entire duration of the call. Even if the network is free, only the fixed amount is allocated. This gives good performance at the cost of wasting resource. Whereas in packet-switched network, there is no fixed bandwidth and has full utilization of the network. But this full utilization comes at the cost of delays and unreliability of packet delivery.

**Unreliable clocks**

Clocks and times are used for the following purposes.

35. Has this request timed out yet?
36. What’s TP99 time for this service?
37. What is the throughput in the last 5 minutes?
38. How long did the user spend on the site?
39. When was this article published?
40. When should the reminder email be sent?
41. When does this cache entry expire?
42. What is the timestamp on this error message in the log file?

Each machine on the network has its own clock: usually a quartz crystal oscillator which is not very accurate. It is possible to synchronize clocks (most commonly using Network Time Protocol (NTP)) which adjusts time reported by a group of servers which in-turn get accurate time from a GPS receiver.

**Monotonic vs Time-of-Day clocks**

Modern computers use both clocks

**Time-of-day clocks**

This as per intuition returns current date and time. These are usually synced with NTP. Depending on the adjustment, it may be forcibly reset to jump backwards and hence is not very reliable for measuring elapsed time.

**Monotonic clocks**

These clocks are guaranteed to move forward in time and hence suitable for measuring duration. The absolute value of the clock is meaningless: it might be the number of nanoseconds since the computer was started.

NTP may adjust the frequency at which the monotonic clock moves forward if it detects that the computers’ local quartz is moving faster or slower than the NTP server. (usually speeded up or down by 0.05%)

If you use software that requires synchronized clocks, it is essential to monitor clock offset between all machines. Any node whose clock drifts too far from the others should be declared dead and removed from the cluster.

**Timestamp for ordering events**

In a multi-leader replication system, when a user writes x=1 on node 1 (timestamp in node1 at that time in 42.004 seconds); the write is replicated to node 3; another user increments x on node 3 (timestamp in node 3 at that time is 42.002); and finally both writes are replicated to node 2. With LWW (Last Write Wins) conflict resolution strategy, the value from node 1 with latest timestamp is replicated on node 2 although node 3 has the latest value.

*Logical-clocks* are based on incrementing counters rather than an oscillating quartz crystal making it a safe alternative.

Some systems have clock readings with confidence range. From a GPS receiver, the range is very small, whereas from a local server it is probably high. Unfortunately, most systems don’t expose this uncertainty. An interesting exception is Google’s TrueTime API in Spanner explicitly reports the confidence interval on the local clock.

**Synchronized clocks for global snapshot**

If there is only one node, the simple counter for transaction ID works. In case of multiple nodes, it is impractical to have a global synchronized counter. Thus for such snapshot isolation cases, Spanner uses TrueTime API to see there are no overlaps between two transactions before making the commit. In order to ensure that the transaction timestamps reflect causality, Spanner deliberately waits for the length of the confidence interval before committing a read-write transaction. And to minimize the wait time, Google deploys GPS receiver or atomic clock in each datacenter to keep the confidence range as small as possible.

**Process pauses**

In a leader-based replication, a leader is recognized by its slaves with periodic renewal of lease for holding the leader position. If the renewal doesn’t happen, one of the slaves will assume the leader position. The leader checks, if there is still time to renew the lease it will process incoming request, else it will renew the license and then process the request. There can be a case when the leader checks the validity and has still more time. But before initiating the process, the system goes for a pause (say, because of garbage collection which pauses the world from time-to-time, or when a laptop user closes the lid, or when the OS context switches to another thread or if an application performs synchronous disk access). Before the pause completes, the lease times out. So the other nodes assume the leader is dead, and one of them start assuming the leader position. But at the same time, the allegedly dead leader can come out of the pause and process the request. An allegedly dead leader processing a request can be dangerous to the system.

Such adverse environments can be avoided. Like Garbage collection can be scheduled at specific times as a planned outage so that other nodes can handle the request while this pause happens.

**Knowledge, Truth and Lies**

**The truth is defined by the majority**

Many distributed algorithms rely on a quorum: decisions require minimum number of votes from several nodes in order to reduce the dependence on any one particular node.

**The leader and the lock**

An allegedly dead leader (after it comes back online, say from a long pause due to GC) cannot continue to write a file that was previously requested because a new leader is doing the job. To prevent this, *fencing* is used. Fencing uses tokens to identify old updates and rejects them. A fencing token thus should be a monotonically increasing value.

**Byzantine faults**

Nodes going rogue or faking data or lying in a network cause such faults. And the problem of reaching consensus in such untrusting environment is known as Byzantine Generals Problem.

Aerospace environments where radiations can cause nodes to behave abnormally, byzantine fault-tolerant systems are needed.  Such byzantine faults don’t usually occur in networks within organization. Web applications do need to expect arbitrary and malicious behaviour of clients that are under user control such as web-browsers. However, we don’t make byzantine fault-tolerant protocols here, but simply make the server the authority on deciding what client behavior is and isn’t allowed. In peer-to-peer networks, when there is no such central authority, fault-tolerance is more relevant.

Most byzantine fault-tolerant algorithms require a supermajority of more than two-thirds of he nodes to be functioning

**Weak forms of lying**

Invalid messages due to hardware issues, software bugs and misconfiguration.

**System models**

With regard to timing assumptions

- Synchronous models
- Partially synchronous models
- Asynchronous models

With respect to node failure

- Crash-stop faults
- Crash-recovery faults
- Byzantine faults

For modeling real system, the partially synchronous model with crash-recovery faults is generally the most useful model.

To cope with these algorithms, the distributed most adhere to the following

- Correctness of an algorithm
    - For example in fencing tokens, tokens must be unique, monotonic sequence and the available node receives a proper response if it does not crash.
- Safety and liveness
    - Safety is informally defined as nothing bad happens (eg. uniqueness and monotonicity)
    - Liveness as something good eventually happens (eg. availability)
- Mapping system models to real world

### Chapter 9. Consistency and Consensus

This chapter deals with fault tolerance similar to how Transaction (in Chapter 7) took care of crashes with Atomicity, concurrency issues with Isolation and reliable storage for Durability. But this time for distributed systems.

Reaching consensus is a tricky problem. We need to understand the scope of what’s possible and what’s not.

**Consistency Guarantees**

Eventual consistency provides weak guarantees. Strong consistency however, have worse performance or be less fault-tolerant.

**Linearizability**

Consider the example, a match_score table is updated with Argentina - 1, Germany - 0 in leader. Alice reloads the webpage and gets response from replica 1 that Argentina has won and tell Bob about it. Bob refreshes the page hits replica 2 and sees that the match is still ongoing. The update took time to reach replica 2 and lagged on the result. If at least one of the replicas has responded with the updated value, it is necessary that all other replicas should guarantee to respond with the updated value. This is known as recency guarantee.

This is different and not to be confused with Serializability. A database may provide both linearizability and serializability and this combination is known as ***strict serializability. ***Implementations of serializability with 2PL and actual serialization are linearizable. However, SSI is not linearizable.

**Relying on linearizability**

- Locking and leader election
    - Every node that starts up tries to acquire the lock and one that succeeds becomes the leader. No matter how this lock is implemented, it must be linearizable: all nodes must agree which node owns the lock.
    - Coordination services like Apache ZooKeeper are often used to implement distributed locks and leader election.
- Constraints and uniqueness guarantees
    - Example, username or email address must uniquely identify a user, similarly bank account balance never goes negative, see more items than you have in stock, or two people don’t concurrently book the same seat in flight or theatre.
    - These constraints all require to be a single up-to-date value that all nodes agree on.
- Cross-channel timing dependencies
    - If Alice had not told Bob about the win by Argentina, Bob would’ve refreshed to eventually know the result. This external communication is popular in some system, where there are 2 channels. If the system is not linearizable, there may be unexpected issues.

**Implementing linearizable systems**

- Single-leader replication - potentially linearizable
    - If you make reads from the leader or from synchronous followers, they have potential to be linearizable. Note the word ‘potential’. Because split-brain may lose linearizability. Asynchronous replication with failovers will violate this property.
- Multi-leader replication - not linearizable
    - These concurrently process writes on multiple nodes and asynchronously replicate them to other nodes. Such conflicts are an artifact of the lack of a single copy of the data.
- Leaderless replication - probably not linearizable
    - Depending on the exact configuration of the quorums, LWW conflict resolution based on time-of-day clocks are almost certainly non-linearizable. Even with strict quorum, non linearizable behavior is possible. Refer figure 9-6.

**The cost of linearizability**

The CAP theorem

- If your application requires linearizability and some replicas are disconnected from the other replicas due to a network problem, then some replicas cannot process requests while they are disconnected: they must either wait until the network is fixed, or return an error.
- If your application does not require linearizability, then it can be written in a way that each replica can process requests independently, even if it is disconnected from other replicas. (eg. multi-leader). In this case, the application can remain available in the face of this problem, but its behaviour is not linearizable.

This insight is popularly known as CAP theorem. CAP is sometimes represented as *Consistency, Availability, Partition tolerance: pick 2 out of 3. *This is misleading. It can be restated as *either Consistent(Linearizable) or Available when Partitioned (network partitioned)*

**Ordering Guarantees**

Causality imposes an ordering on events: cause comes before effect; a message is sent before the at message is received. If a system obeys order imposed by causality, then it is causally consistent. Eg. Snapshot isolation provides causal consistency.

**Causal order is not total order**

Natural numbers are totally ordered. Eg. 5 > 13

However, mathematical sets are not totally ordered. Say, {a, b} > {b, c} ? They are incomparable and therefore mathematical sets are partially ordered. In some cases one is greater than another (if one set contains all the elements of another), but in other cases they are incomparable.

In a Linearizable system, we have a **total order** of operations.

In a causal system, we have a partial order (concurrent transactions are possible).

Therefore by this definition, there must be no concurrent transactions in linearizable datastore: there must be a single line along which all the operations are totally ordered. Concurrency would mean that timelines and branches and merges again.

**Linearizability is stronger than causal consistency**

Which means linearizability implies causal consistency (although this comes at the cost of performance hit). The good news is that a middle ground is possible. Linearizability is not the only way of preserving causality. In fact, causal consistency is the strongest possible consistency model that does not slow down due to network delays, and remains available in the face of network delay.

**Capturing causal dependencies**

The techniques for determining which operation happened before which other operation are similar to what we discussed in “Detecting concurrent writes”. Causal consistency goes further: it needs to track causal dependencies across the entire database, not just a single key. Version vectors can be generalized to do this.

**Sequence number ordering**

Keeping track of all causal dependencies can become impracticable. Instead we can use sequence numbers or timestamp to order events.A timestamp need not come from a time-of-day clock, instead can come from a logical clock, which is an algorithm to generate a sequence of numbers to identify operations. Such numbers are compact and they provide a total order.

This is straight-forward for single-leader replication. For multi-leader or leaderless replication various methods can be used:

- Assign even numbers for one node and odd number for the other. In general, you can reserve bits in the binary representation and this would ensure that no two nodes generate the same sequence number.
- Use time-of-day clocks if they have sufficiently high resolution.
- Preallocate blocks of sequence numbers

However, all of these have a problem. They do not correctly capture the ordering of events across different nodes: i.e. The counter for even numbers may lag behind the counter for odd numbers.

**Lamport timestamps**

It is simply a pair of (counter, nodeID) pair. This is the same as odd even counters. The key idea about Lamport timestamps, which makes them consistent with causality, is the following: every node and every client keeps track of the maximum counter value it has seen so far, and includes that maximum on every request. The advantage of Lamport timestamps over version vectors is that they are more compact.

**Timestamp ordering is not sufficient**

When creating a username and to check whether that username is already created with a lower timestamp, we need to check every other node to find out. If one of the other nodes has failed or cannot be reached due to a network problem, the system would grind to a halt. Thus total ordering is not sufficient to implement a uniqueness constraint like usernames. This is captured in total order broadcast.

**Total order broadcast**

It is usually described as a protocol for exchanging messages between nodes. Informally it requires 2 safety properties always be satisfied:

- Reliable delivery = no messages are lost; if a message is delivered to one nodes it is delivered to all nodes.
- Totally ordered delivery = Messages are delivered to every nodes in the same order.

An important aspect of total order broadcast is that the order is fixed at the time the messages are delivered: a node is not allowed to retroactively insert a message into an earlier position in the order if subsequent messages have already been delivered.

DID NOT FULLY UNDERSTAND. NEED TO REVISIT AFTER THE END OF THIS CHAPTER.

**Distributed transactions and Consensus**

There are a number of situations in which it is important for nodes to agree.

- Leader election - avoid split brain
- Atomic commit - for transactions spanning several nodes or partitions

**Two-phase commit** algorithm is the most common way of implementing atomic commit and used in various DBs, messaging systems, and application servers. 2PC is a kind of a consensus algorithm, but not a very good one. We will later visit ZooKeeper’s Zab and etcd’s Raft.

**Atomic Commit and 2PC**

Atomicity prevents failed transaction from littering the database and keeping secondary index intact with the primary index. This is easy for single node DBs where writing the data to disk means the commit is successful, or it is recovered from commit record.

In a multi node scenario, if some nodes commit and transaction but other abort it, the nodes become inconsistent with each other. For this reason, a node must only commit once it is certain that all other nodes in the transaction are also going to commit.

2PC uses a new component that does not normally appear in single-node transactions: a *coordinator. *Eg. Narayana, JOTM, BTM, MSDTC.

2PC begins by writing data to multiple nodes (participants), as normal. When the application is ready to commit, the coordinator begins phase 1: it send a prepare request to each of the nodes asking them whether they are able to commit. If all the participants reply yes, coordinator sends out a commit request in phase 2 and the commit actually takes place. If any of the participants reply no, the coordinator send an abort request to all nodes in phase 2.

**A system of promises**

When the participants reply “yes”, it promises that it will definitely be able to commit later.

**Coordinator Failure**

It is necessary for the coordinator to write its commit or abort decision to a transaction log on disk before sending requests to participants. Thus 2PC comes down to a regular single-node atomic commit on the coordinator.

**Three-phase commit**

2PC is called a blocking atomic commit protocol because it can get stuck waiting for the coordinator to recover from crash. As an alternative to 2PC, 3PC has been proposed. However, 3PC assumes a network with bounded delay and nodes with bounded response times.

In general, a non-blocking atomic commit requires a *perfect failure detector*. Since it is impossible to tell a network failure from a node crash 2PC continues to be used.

**Distributed transactions in practice**

Distributed transactions in MySQL are reported to be 10x slower than single-node transactions.

- Database internal distributed transaction
- Heterogeneous distributed transactions
    - XA transactions (X/ Open XA - a C API for interfacing with transaction coordinator)

**Fault-tolerant Consensus**

A consensus algorithm must satisfy the following properties:

- Uniform agreement
    - No two nodes decide differently
- Integrity
    - No node decides twice
- Validity
    - If a node decides value v, then v was proposed by some node.
- Termination
    - Every node that does not crash, eventually decides on some value.

Satisfying the first 3 properties (Safetiness) is easy with a single coordinator as discussed in previous sections. Satisfying the 4th property (liveness) formalizes the idea of fault tolerance. The termination property is subject to the assumption that fewer than half of the nodes are crashed or unreachable.

**Consensus algorithms and total order broadcast**

The best known fault-tolerant consensus algorithms are View stamped Replication (VSR), Paxos, Raft, and Zab.

**Single leader replication and consensus**

Remember split brain which requires consensus for leader election? To elect a leader we need a leader, for which again a consensus algorithm is needed. So to solve consensus, we need to solve consensus?!

**Epoch numbering and quorums**

All of the consensus protocols internally use a leader in some form or another, but they don't guarantee that the leader is unique. Instead they make a wekare guarantee: the protocols define an epoch number. And guarantee that within epoch number, the leader is unique.

Every time a leader is throught to be dead, a vote is started amont the nodes to elect a new leader. This election is given an incremented epoch number and thus it is totally ordered. If there is a conflict between 2 different nodes in 2 different epochs (perhaps because the previous leader actually wasn’t dead after all), then the leader with the higher epoch number prevails.

Before a leader is allowed to decide anythigng, it must first check that there isn’t some other leader with a higher epoch number. It collects votes from a quorum of nodes. A node votes in favor of a proposal only if it is not aware of any other leader with a higher epoch.

Thus we have 2 rounds of voting, once to choose a leader, and a second time to vote on a leader’s proposal. The key insight is that the nodes voted for 2 rounds must overlap. Though this makes things fault-tolerant, it comes at a cost. This leader election is a kind of synchronous replication. Consensus systems always require a strict majority to operate. In practice, Raft for example, has edge cases which causes leader election to jump between nodes, keeping the system occupied instead of doing useful work.

**Membership and coordination services**

Eg. ZooKeeper and etcd. These look pretty much like a distributed datastore with read and write on key-value pairs. But they are not general purpose. It is indirectly used via other projects like HBase, Hadoop, YARN, OpenStack Nova, Kafka.

ZooKeeper and etcd hold small amounts of data that can be entirely in memory (although written to disk for durability). In addition to providing total order broadcast, they provide other features useful when building distributed systems.

- Linearizable atomic operations
- Total ordering of operations
- Failure detection
- Change notifications
- Allocating work to nodes
    - Leader election, rebalancing partition
- Service discovery
    - Consensus is not used directly. But the result of consensus (like the elected leader’s IP address) can be sent to service endpoints for discovery.
- Membership services
    - Which members are active and live in the cluster

# Part III. Derived Data

In this final part of the book, we will examine issues around integrating multiple different data systems, potentially with different data models and optimized for different access patterns, into one coherent application architecture.

## System of Record and Derived Data

A **System of Record** is also known as the source of truth.

**Derived data** is the result of taking some existing data from another system and transforming or processing int in some way. Eg. Cache database.

### Chapter 10. Batch Processing

3 different types of system

43. Services (online systems)
44. Batch processing system (offline systems) Eg. MapReduce
45. Stream processing (near-real-time systems)
    1. Somewhere between services and batch processing

**Unix tools**

cat access.log | awk ‘{print $7}’ | sort | uniq -c | sort -r -n | head -n 5

There are some powerful tools which have seamless interoperability in input and output. But this is not the norm now-a-days. Even database systems don’t make it easy to get data out of one into another. This lack of integration leads to Balkanization.

**MapReduce and Distributed Filesystems**

MapReduce is a bit like unix tools but distributed across potentially thousands of machines. While unix tools use stdin and stdout as IO, MapReduce jobs read and write files on a distributed file system. In Hadoop’s implementation of MapReduce, that filesystem is called HDFS (Hadoop Distributed File System), an open source reimplementation of Google File System (GFS).

HDFS consists of a daemon process running on each machine, exposing a network service that allows other nodes to access files stored on that machine. A central server called NameNode keeps track of which file blocks are stored on which machine. Thus it conceptually creates one big filesystem. To tolerate machine and disk failures, file blocks are replicated on multiple machines (by making copies or an erasure coding scheme such as Reed-Solomon code).

**MapReduce Job execution**

The pattern of data processing in MapReduce is as follows: (just like the log parsing with unix tool as above)

46. Read a set of input files and break it up into **records**. In the log example, each line is a record.
47. Call the **mapper function** to extract a key and value from each input record. Eg. $7
48. **Sort** all the key-value pairs by key.
49. Call the **reducer function** to iterate over the sorted key-value pairs. Multiple occurrences occur continuously and easy to combine.

These 4 steps can be performed by one MapReduce job. Steps 2 and 4 are where you write custom data processing code. The role of the mapper is to prepare the data by putting it into a form that is suitable for sorting, and the role of the reducer is to process the data that has been sorted.

**Distributed execution of MapReduce**

The input to a job is typically a directory in HDFS and each file or file block within the input directory is considered to be a separate partition that can be processed by a separate map task. Each file is typically 100s of MBs in size. The MapReduce scheduler tries to run each mapper on one of the machines that stores a replica of the input file. This principle is known as **putting the computation near the data **- it saves copying the input file over the network.

The reduce side of the computation is also partitioned. While the number of map tasks is determined by the number of input file blocks, the number of reduce tasks is configured by the author. To ensure that all key-val pairs with the same key end up in the same reducer, the framework uses a hash of the key to determine which reduce task should receive a particular key-value pair.

The key-value pair must be sorted, but the dataset is likely too large to be sorted with conventional sorting algorithm on a single machine. Instead, sorting is performed in stages. First, each map task partitions its output by reducer, based on the hash of the key. Each of these partitions is written to a sorted file on the mapper’s local disk, using a technique similar to the one discussed in SSTables and LSM-Trees.

Once this is done, the scheduler notifies the reducers that they can start fetching the output files from that mapper. The reducers connect to each of the mapper and downloads the sorted key-value pair for their partition. This process is known as **Shuffling** (though there is no randomness involved).

The reduce task takes the files from the mapper and merges them together, preserving the sort order. Thus, if different mappers produced records with the same key, they will be adjacent in the merged reducer input. The reducer is called with a key and an iterator that sequentially scans over all records with the same key. The reducer can use arbitrary logic to process these records, and can generate any number of output records. These output records are written to a file on the distributed file system (usually one copy on the local disk of the machine running the reducer, with replicas on other machines).

**MapReduce workflows**

It is generally common for MapReduce jobs to be chained together into workflows, such that the output of one job becomes the input to the next job into **workflows**.

**Reduce-side Joins and Groupings**

Grouping related data together

- Join
- Group By
- Handling skew

**Map-side Joins**

- Broadcast hash joins
- Partitioned hash joins
- Map-side merge joins
- Workflows with map-side joions

**Output of Batch workflows**

- Building search indexes
- Key-value stores as batch process output

**Comparing Hadoop to distributed databases**

Diversity of storage

Diversity of processing models

**Beyond MapReduce**

Materialization of intermediate states is a downside in MapReduce for workflows where intermediate states are not used by other teams and is used as input to another job owned by the same team.

- A MapReduce job can only start when all the jobs in the previous jobs have completed.
- Mappers are often redundant: they just read back the same file that was just written by a reducer.
- Storing intermediate state in a distributed file system mean replication is done (overkill).

**Dataflow engines**

In order to fix these problems, several new executed engines for distributed batch computations were developed. Eg. Spark, Tex, Flink. All of these handle an entire workflow as one job, rather than breaking it up into independent subjobs.

Since they explicitly model the flow of data through several processing stages, these systems are known as dataflow engines. Like MapReduce they work by repeatedly calling a user-defined function to process records. Parallelized by partitioning inputs, and copy output to another function in the network. Unlike MapReduce, these functions need not take strict roles of alternating map and reduce, but instead can be assembled in more flexible ways. These functions are called operators. The dataflow engine provides multiple options to connect a stage’s output to another stage’s input.

This style of processing engine offers several advantages compared to the MapReduce model:

- Expensive work such as sorting need only be performed in places where it is actually required.
- There are no unnecessary map task
- Because all joins and data dependencies in a workflow are explicitly declared, the scheduler has an overview of what data is required where, so it can make locality optimizations.
- It is usually sufficient for intermediate state between operators to be kept in memory or written to local disk, which requires less I/O than writing it to HDFS.
- Operators can start executing as soon as their input is ready; no need to wait for the entire preceding stage.
- Existing JVM process can be reused to run new operators, reducing startup overheads compared to MapReduce

Fault tolerance is an advantage in MapReduce with materializing intermediate state. Which is why Spark, Flink and Tez take a different approach. When a machine fails, it is recomputed from the previous intermediate state or from the original data. To enable this recomputation, Spark uses resilient distributed dataset (RDD) abstraction for tracking the ancestry of data while Flink checkpoints operator state, allowing it to resume running an operator that ran into a fault during its execution. Also need to make sure the input and output are deterministic. Same output should be produced by operator every time it is run.

**Graphs and iterative processing**

The pregel processing model - Bulk Synchronous Parallel (BSP) model - Apache Giraf

**High-level APIs and Languages**

Hive, Pig, Cascading and Crunch became popular because programming MapReduce jobs by hand is quite laborious. These usually have declarative APIs which internally analyzes the data and decides on optimizations in joins and select with query optimizers.

### Chapter 11. Stream Processing

- Transmitting event streams
- Databases and streams
- Processing streams

**Transmitting event streams**

Record in batch processing is known as event in stream processing. An event is generated once by a producer and then potentially processed by multiple consumers. In a filesystem, a file name identifies a set of related records; in a streaming system, related events are usually grouped together into a topic or stream.

**Messaging systems**

A common approach for notifying consumers about new events is to use a messaging system.

**Direct messaging from producers to consumers**

- UDP multicast is used in financial industry for streams such as stock market feeds, where low latency is important.
- Brokerless messaging libraries such as ZeroMQ take a similar approach, implementing publish/subscribe messaging over TCP or IP multicast.
- StatsD use unreliable UDP messaging for collecting metrics
- If the consumer exposes a service on the network, producers can make a direct HTTP or RPC request to push messages to the consumer.

Although these direct messaging systems work well in the situations for which they are designed, they generally require the application code to be aware of the possibility of message loss.

**Message brokers**

A widely used alternative is to send messages via a message broker (also known as message queue), which is essentially a database that is optimized for handling message streams. So the question of durability is moved to the broker instead.

**Message brokers compared to databases**

Some message brokers can even participate in 2PC protocols using XA or JTA. This makes them quite similar in nature to databases, although there are still important practical differences:

- Databases usually keep data until it is explicitly deleted, whereas most message brokers automatically delete a message when it has been successfully delivered to its consumers.
- Since they quickly delete messages, most message brokers assume their working set is fairly small - i.e. queues are small.
- Database often support secondary indexes and various ways of searching for data, while message brokers often support some way of subscribing to a subset of topics matching some pattern.

**Multiple consumers**

In this case 2 main patterns of messaging are used

- Load Balancing
    - Each message is delivered to **one** of the consumers, so the consumers can share the work of processing the messages in the topic.
- Fanout
    - Each message is delivered to **all** of the consumers. Fan-out allows several independent consumers to each “tune-in” to the same broadcast of messages.

The 2 patterns can be combined as well.

**Acknowledgments and redelivery**

A consumer must explicitly tell the broker when it has finished processing a message so that the broker can remove it from the queue.

**Partitioned Logs**

Combining the durable storage approach of databases with the low-latency notification facilities of messaging is the idea behind **log-based message brokers.**

**Using logs for message storage**

A log is simply an append-only sequence of records on disk. Same log structure used in Chapter 3 and 5 can be used. Producer appends to log file and consumer reads from the end of log file, just like tail -f. In order to scale to higher throughput than a single disk can offer, the log can be partitioned. Within each partition the broker assigns a monotonically increasing sequence number or offset to every message. Apache Kafka, Amazon Kinesis streams and Twitter’s DistributedLog are log-based message brokers.

In conclusion, log-based message passing works well if ordering needs to be maintained, else older approach is to be used for high throughput.

**Consumer offsets**

Similar to log sequence number is single leader replication. If the consumer had processed subsequent message but not yet recorder their offset, those message will be processed a second time upon restart. We will discuss ways of dealing with this issue later in the chapter.

**Disk space usage**

To reclaim disk space, the log is actually divided into segments and from time to time old segments are deleted or moved to archive storage. This means if a slow consumer cannot keep up, its offset will point to a deleted segment and miss some of the messages. This limited storage is maintained as a **circular buffer or ring buffer.**

**Database and Streams**

**Keeping systems in sync**

Whenever data changes it needs to be synced across caches, search indexes and data warehouses. If periodic database dumps are too slow, an alternative that is sometimes used is **dual writes**, in which an application code writes to each of the systems when data changes. Dual writes have serious problems, one of which is race condition and another is that one of the writes may fail while the other succeeds.

**Change data capture**

Most databases didn’t expose APIs to access the replication log which can be used to replicate data to different storage technology such as search index, cache or data warehouse. More recently, there has been growing interest in Change Data Capture (CDC). A log-based message broker is well suited for transporting the change events from the source database to the derived system, since it preserves the ordering of messages. Since this model is asynchronous, all the issues of replication lag apply.

**Event Sourcing**

CDC operates at low level database internals like replication log. Whereas event sourcing relies on application level. For eg. “student cancelled their course enrollment” clearly expresses the intent in a neutral fashion, whereas the side effects “one entry was deleted from the enrollments table, and one cancellation reason was added to the student feedback table” embed a lot of assumptions about the way the data is later going to be used.

**State, Streams and Immutability**

We saw in Batch Processing that input is immutable, so you can run experimental processing jobs on existing input files without fear of damaging them. This principle of immutability is also what makes event sourcing and change data capture so powerful.

In shopping cart example, when a user adds an item and then later decides to remove that item, the entry in that database in lost. But we need it for analytical reasons to know why the user decided to remove the item.

**Processing Streams**

Broadly there are three options:

50. Take the data in the events and write it to a database, cache, search index, or similar storage system, from where it can then be queried by other clients.
51. Push the events to users in some way, for example by sending email or push notifications, or by streaming the events to a real-time dashboard. In this case, a human is the ultimate consumer.
52. You can process one or more input streams to produce one or more output streams. Streams may go through a pipeline consisting of several such processing stages before they eventually end up at 1 or 2.

In the rest of this chapter, we will discuss option 3. A piece of code that processes streams like this is known as an operator or a job. (just like MapReduce and Unix tools). The one crucial difference with batch processing is that a stream never ends. Some of the implications of this are

- Sorting does not make sense with unbounded dataset. So sort-merge joins cannot be used.
- Fault tolerance - in a batch process when a task fails it can simply be restarted, but with a stream job that has been running for several years, restarting after a crash may not be a viable option.

**Uses of Stream Processing**

It’s long been used for monitoring purposes.

- Fraud detection systems need to determine if the sage patterns of a credit card have unexpectedly changed.
- Trading systems need to examine price changes in a financial market
- Manufacturing systems need to monitor the status of machines in a factory.
- Military and intelligence systems need to track the activities of a potential aggressor.

**Complex event processing**

CEP is an approach developed in the 90s for analyzing event streams, especially the kind that searches for certain patterns. These often use high level declarative language like SQL.

In these systems, relationships between query and data is reversed compared to a normal database. Usually, a database stores data persistently and treats queries as transient: when a query comes in, the database searches for data matching the query, and then forgets about the query. In CEP engines, queries are stored long-term, and events from the input streams continuously flow past them in search of a query that matches an event pattern.

**Stream analytics**

There is a blurry boundary between this and CEP. But this generally tends towards aggregations and statistical metrics over a large number of events

- Measuring the rate of some type of event
- Calculating the rolling average of a value over some time period.

Such statistics are usually computed over fixed time intervals. Stream analytics sometime use probabilistic algorithms like Bloom filters for set membership, HyperLogLog for cardinality estimation, and various percentile estimation algorithms. Probabilistic algorithms produce approximate results, but have the advantage of requiring significantly less memory in the stream processor than exact algorithms.

**Reasoning about time**

Considering metrics upload scenario, there is creation timestamp, upload timestamp, processing timestamp.

Multiple types of windows

- Tumbling window
- Hopping window
- Sliding window
- Session window

**Stream joins**

- Stream-stream joins
    - An event whenever user searches for something
    - An event whenever a search result is clicked.
    - We need to join these to identify the click-through rate to identify the quality of search results.
    - We do this join by maintaining indexes based on the session ID and emit metric whenever there is a match in both the indexes.
- Stream-table join
    - Similar to user profile database and user activity events seen in batch processing
    - User profile can be stored in-memory as a hash table or map to local disk indexes instead of making DB queries every time.
    - Changes to DB can be notified to local machine with Change Data Capture (CDC).
- Table-Table join
    - Consider the twitter timeline. When a user wants to view their home timeline, it is too expensive to iterate over all the people the user is following, find their recent tweets and merge them.
    - Instead, we want a timeline cache: a kind of per-user “inbox” to which tweets are written as they are sent, so that reading the timeline is a single lookup. This requires the following event processing:
        - When user u send a new tweet, it is added to the timeline of every user who is following u.
        - When a user deletes a tweet, it is removed from all users’ timelines.
        - When user u1 starts following user u2, recent tweets by u2 are added to u1’s timeline.
        - When user u1 unfollow user y1, tweets by u2 are removed from u1’s timeline.

**Fault tolerance**

In batch processing, if something fails, the processing can be simply restarted again since input files are immutable. Since a stream is infinite, there is no concept of finish processing.

**Microbatching and checkpointing**

Streams are broken into small blocks typically around one second window of events. A variant approach is used in Apache Flink where rolling checkpoints are used and data is written to durable storage.

To avoid double processing, we use atomic commit logic (same as that discussed in distributed transactions like XA, but more efficiently since this does not involve heterogenous systems).

Another approach is **Idempotence**. Even if you process it multiple times, the net output is as though you processed it only once. Setting a key-value store to some fixed value is idempotent whereas incrementing a counter is not idempotent.

In order to recover from failure, the stream processor periodically replicates its state (windowed aggregations like averages, counters, etc) and resume processing without data loss.

### Chapter 12. The Future of Data Systems
