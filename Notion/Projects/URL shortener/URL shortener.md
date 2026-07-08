---

---
# Requirements

<!-- Column 1 -->
### v1

- Generate a short alias for a given URL
- Return URL for a given alias
- Custom alias for URLs
- REST APIs

<!-- Column 2 -->
### v2

- Front-end
- URL lifespan
- Authorization
- API token

<!-- Column 3 -->
### v3

- Analytics

### Non-functional requirements

- Highly consistent
- Alias must not be guessable
- Low latency

# Capacity estimation

![[Summary.base]]

> [!note]+ **Detailed estimation**
> ### Traffic estimates
> 
> Assuming 10M new URLs per day and considering 100:1 :: reads:write
> 
> No. of queries per day = reads + writes = (10M * 100) + 10M = ~1B
> 
> **No. of reads ** = 1B / (24 * 60 * 60)   = **12K QPS**
> 
> **No. of writes** = 10M / (24 * 60 * 60) = **120 QPS**
> 
> ### Storage estimates
> 
> Assuming storage of URLs for at least 5 years
> 
> Total URLs = 10M * 30 * 12 * 5 = 18B
> 
> **Total size** = total URLs * average size per entry = 18B * 500 bytes = **10 TB**
> 
> ### Bandwidth estimates
> 
> **Write bandwidth **= 120 * 500 = **60 KB/s**
> 
> **Read bandwidth** = 12K * 500 = **6 MB/s**
> 
> ### Memory estimates
> 
> Assuming we cache hot URLs, using the 80-20 rule
> 
> **Cache size** = URLs per day * size of each entry * 20% = 1B * 500 bytes * 0.2 = **100 GB**

# High level tasks

> [!note]+ Back-end
> > [!note]+ Milestone1 - Serverless
> > - Lambda using Go
> > - Generate hash val based on input
> > - Store key-val in DynamoDB
> > - API Gateway for endpoint access?
> 
> > [!note]+ Milestone2 - IaC
> > - Terraform 
> 
> > [!note]+ Milestone3 - Docker image
> > - Lambda with Docker image. Why?
> 
> > [!note]+ Milestone4 - Server
> > - Move to EC2
> 
> > [!note]+ Milestone5 - Custom scaling
> > - With custom sharding and replication
> 

> [!note]+ Front-end
> > [!tip] 💡
> > [https://main.d1uwmqm5yhree5.amplifyapp.com/](https://main.d1uwmqm5yhree5.amplifyapp.com/) 

> [!note]+ Domain name
> - Best domain registrar - [https://neilpatel.com/blog/best-domain-registrar/](https://neilpatel.com/blog/best-domain-registrar/)
>     - [Google domains](https://domains.google/) or [Namecheap](https://www.namecheap.com/)
> - Candidate names
>     - [ ] adhu.xyz
>     - [ ] kutti.me
>     - [ ] rickr.xyz

> [!note]+ Server to host website
> - AWS

> [!note]+ SSL cert


> [!note]+ Security & Privacy


![[Tasks.base]]

# Repository

[Github repo](https://github.com/bharathbhargavgb/short-url)

# Notes

**Learn Golang**

- Go tutorial - [https://golang.org/doc/tutorial/](https://golang.org/doc/tutorial/)
- Concurrency is not Parallelism - [https://www.youtube.com/watch?v=oV9rvDllKEg](https://www.youtube.com/watch?v=oV9rvDllKEg)

**AWS CLI installation**

- [https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html)

**Lambda - Basic Key-Value store implementation**

### Swagger

[https://app.swaggerhub.com/apis-docs/resurgence/shorten/1.0.0](https://app.swaggerhub.com/apis-docs/resurgence/shorten/1.0.0)
