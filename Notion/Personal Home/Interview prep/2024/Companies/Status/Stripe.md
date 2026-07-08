---
base: "[[Status.base]]"
Status: Rejected
Assign: []
---
[Software Engineer - Infrastructure](https://stripe.com/jobs/listing/software-engineer-infrastructure/6042172)

[Software Engineer, ML Infrastructure](https://stripe.com/jobs/listing/software-engineer-ml-infrastructure/6073670)

- [x] Profitable?
- [x] What roles are in demand right now?
- [x] layoffs?
    - [ ] Has the hiring rate decreased?
    - [ ] Job security
- [x] Team match with multiple options?
- [x] How long has this position been open? And how many positions?
    - [ ] Career progression?
- [ ] What stood out in my resume?


Reliability, scale and perf & productivity

Developer infra

pipeline model for hiring - team match later

300 people layoff - reorg 

9000 population

interview proess

team screen - 1 hr zoom - practical coding

no leetcode, no DS - quality and abstractions

multipart questions - make some progress

5 

3 codng

1 sys

1 hm chat

hybrid - public library


work auth - [US Immigration Candidate FAQs (Q4/2024)](https://docs.google.com/document/d/1pELCTOI3FyfF9O9jT00pdiwITAKa9PNeSemsVM35y80/edit?usp=sharing)



March 7th - phone screen

Happened on hackerrank with questions unlocked as I finished each

10 min at the start for intro and 

45 min for coding

5 min at the end for questions

**3 part string manipulation question**

1. Given application IDs of a credit card as a single string, parse it
    1. Format of the input string: ##ABCDE12345##ZXCVB98765540
    2. ## represents a 2 digit number and that many characters follow representing the application ID
    3. The string is terminated with a 0.
    4. Application ID is at least 10 digits long
2. Now given a list of supported application IDs, match that with the list parsed above and return only those matches
3. Sometimes the input string can only have the 1st 10 digits representing the RID. So do a prefix match with the list of supported application IDs. Return without duplicates.
4. (Optional) Return in the same order as the duplicates.


### Recruiter call (4/1)

- [ ] Is C++ okay for the rest of the interviews?
- [ ] 3P libraries
- [ ] How to prepare? resources - samples
    - [x] How to time my interview progress, familiarity
- [ ] Design challenge
    - [ ] System design or product design
- [ ] Integration
    - [ ] Familiarity with libraries
    - [ ] 
- [x] Bug squash
    - [x] Github repo with test - compiles locally?
    - [x] Do you have to find and fix the bug or just the thought process or understanding the code base a green signal?
- [x] Programming exercise
    - [x] Local IDE was not used. Hackerrank was used
    - [x] Should I expect something similar


**Tips**

practical coding - same style - no leetcode - collaborative signal - communication is king

5. ask clarification questions - full scope
6. read prompts a couple times
7. share thoughts - design approach before implementation
8. keep communicating

Technical setup

9. Familiar IDE
10. Github account active

**Programming exercise** - same as team screen

10m - setup 

45m - coding

no fancy solution needed

Call out way to improve - when running out of time

forward progress

**Bug squash**

Bug report - fix - 

github repo - clone - run test - fails - bug or bugs

stuck? - ask for help - google

forward progress - not required to fix to succeed

communicate

**Integration**

integrates with API and libraries

List of reqs - read entirely - ask clarification

Evaluate how to search the internet

Introduce new code - quality and readability

**Design** - 45m

Have the whiteboard ready

Million right answers - few wrong answers

tech lead explaining design to a manager

read multiple times

functional and non-functional requirements

low-level distributed system

notice mistake - change approach

**HM chat - 45m**

Conversational interview 

Ask questions about the open role and that team

1 or 2 most technically challenging projects you’ve led

professional goals

alignment with stripe

why stripe

behavioral questions - star method


**Tell me about the most complex project you’ve worked on**

Hmm, I guess one of the complex projects I’ve worked on is build optimization - let me set some context here - I work at Amazon’s Kindle org - Kindle does everything from scratch - It’s not a standard html where you render and display text - The backend libraries talk directly to the OS kernel and graphics layer to render content on the screen. As a result, we own the code for everything. Starting from SDK, conversion, rendering, application layer. So if someone at the bottom of the stack initiates a build, it would take 10 hours to complete. It was really frustrating for people at the bottom of stack to wait for 10 hours only to find out that there was a problem with a package at the top of the stack. People have obviously tried trying to cut down the build time looking at each package individually. But it didn’t work out much. They would shave off a couple of minutes. Maybe an hour utmost. And that would be quickly offset by someone developing a new feature, adding to the build time. 

I didn’t want to take that route because the returns I would get by spending so much effort is probably 1 hour at the max. I wanted to make a change that would work agnostic of the package. And we set a target to cut it down to 50% for the effort to make sense. After some research, I came with an idea. Since the stack was predominantly C++, we could parallelize compile time and link time. So if package A has finished compiling and generated a static library, then package B (which is a consumer of package A) can start building. It need not wait for the test binary of package A to finish. Things can happen in parallel. It made a big difference with build time. 

Do interrupt me if going too deep into technical details.

This project span for almost 3 months. It required coordination between several teams. 1 person from each team was loaned to make changes to the packages they owned. Not all teams were immediately on board. Amazon has this single-threaded model where if you want to make a change in a partner team’s codebase, you are empowered to go make the change yourself instead of expecting someone from that team to prioritize and pick up the feature. So I led a couple members from my team to complete the tail-end of the project. The leadership team was not convinced immediately. There were some counterarguments because SDK doesn’t make changes often. That was true for the most part but there has been times when there happened to be new feature additions requiring huge SDK changes. We anticipated changes for upcoming features in the roadmap. Its also not just SDK. All the packages in the middle of the stack could also benefit from this change. 

In addition, I created a prototype of this change with just a couple of packages that my team owned. I demonstrated how much time savings this brought forth and estimated how much benefit could be realized by making this change across the stack. My manager was onboard and helped me take this to leadership. 

This was part one. And theres a 2nd part. Now that I’ve parallelized the packages, there came another optimization opportunity. Every time a package finished building, it needs to upload the built artifact to S3. And the consuming package has to download all its dependencies from S3 again. This upload and download across all packages adds up to a lot. We can prevent one upload and download by building the consuming package on the same server as its dependency.

So I looked at the metrics. We get build logs, store it to S3 and then do analytics on AWS redshift. On each level of the dependency graph, we know which package is consuming the most time. So the most time consuming package at each level gets into the same machine. Narrow dependency vs wide dependency packages are treated differently. This use case mostly works for narrow dependency machines. 

There were some problems though. This project made drastic improvements to the overall build time. But it made developers’ life difficult. They had to checkout both the lib package as well as the link package. Build each of them separately. It doubled the number of packages that developers had to work on. I followed-up and wrote a script that as part of the git hook, will recognize that its a split package and checkout all the needed setup, create the structure needed, so that developers become fully abstracted to the package split. So any build that runs locally will function the same way as before. 

**What other problems did you face with this project?**

Communication did not go through properly. There were some teams hit with issues because of how the packages were split. They had some assumptions in some of their code logic. It was not a great pattern for them to make assumptions in the first place. Nevertheless, there should’ve been active communication to them.

Jenkins configuration was not reviewed properly. We were doing a rolling deployment, but somehow that config was not persisted after a restart. And builds were failing unable to find a machine to run on. There were some people from the OE team who were not aware of this. The root cause of these problems turned out to be the lack of version control system w.r.t. jenkins config. So we fixed that.

**What would the management say about your performance?**

11. Could’ve been better with communication
12. Could’ve presented the business impact of a project more clearly

Bug bash - yaml parser

Integration - Arena allocator

Coding - Welcome, Upcoming expiry, Expired - email subject for people with different subscription

Design - ledger to maintain merchant transactions - addTransaction, getBalance APIs


- [x] Stripe winding down in India
- [x] Full suite of products 
- [x] [Link.com](http://link.com/) was smooth
- [x] Revise stripe WTE and emails
- [ ] Questions to ask in Stripe interview - [https://jvns.ca/blog/2013/12/30/questions-im-asking-in-interviews/](https://jvns.ca/blog/2013/12/30/questions-im-asking-in-interviews/)
- [x] One of the interview questions will be structured around HTTP requests. You should have a working familiarity of an HTTP client of your choice in the language you are interviewing in. You should expect to be making HTTP requests to a public API and making use of the responses. A high-level understanding of this article is a good reference.
- [x] We’ve created a C++ project to help you determine if your computer has the required software and is configured correctly to write C++, at least at a level that some of our questions expect. Before your interview, please visit the repository and follow the instructions under the “Getting Ready” section.
- [x] [Whimsical](https://whimsical.com/) collaboration tool - setup  https://docs.google.com/document/d/1EvJAA8d5lxQLbgP_-CDVFLw6E6oCZQLaqAQYoEw1AIc/edit?tab=t.0#heading=h.o2uph5rstna 
- [ ] Stripe interview experience research