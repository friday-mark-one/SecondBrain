---
notion-id: 1e402d25-148c-803f-8cb1-f93522db4e91
---
1. Driving results
2. Resolving conflicts
3. Embracing ambiguity
4. Growing continuously
5. Communicating effectively

6. Eink waveform
7. Build optimization
8. Delegation of work and context switching
9. EAA - EU regulation
10. Foxit negotiation
11. Another manager stealing projects
12. KUX engine vs ReactNative
13. Talkback source code with AI
14. Reading vs Editing SDK
15. Barolo launch
16. Docker container for dev box
17. Strength - easy to grasp new concepts, dive deep into things with breadth of knowledge, curious learner

### Build optimization

developers complained about end-to-end build time

Kindle is a deep stack - SDK - conversion - rendering - client layers

almost C++ 100 packages

takes around 8 hours to complete - bottom package change

top package 1-2 hours

Previous attempts shaved off few minutes

But gets replaced with new features quickly

**1st idea**

Researched and came up with an idea - separate compile & link process

build - static library

link - executables

Package dependency graph - DAG

Package B → Package A’s static lib

Package C → Package B

Split into ALib / ALink

Onboarded my team’s package 

Saw 20% latency reduction

All of this while doing my main work

Got pushback from leadership before I showed them this improvement

After showing metrics - got on board

Started an org-wide campaign to get all teams on board

I led a cross-functional team - 1 dev from each team (4 initially and then 8)

Teams at bottom of stack onboarded quickly

Took 3 months to complete 100% migration - saved 3 hours totally

Learnings

- Git bisect
- Different build systems
- Missed local development workflow - caused some churns
- Didn’t make sense for all packages - split worsened - caching dependencies repeatedly

**2nd idea**

Build cache - Cache intermediate .o objects in S3

Jenkins - AWS IAM auth - S3 access

Docker registry - LAN

Increased disk usage


- [x] Tell me about a time that a peer or manager gave you a specific, actionable feedback for improvement
    - [ ] Do you agree?
    - [ ] Your reaction?
    - [ ] What action did you take?
    - [ ] Applied to work after that?
        - [ ] Passion for continuous learning
        - [ ] Identify development opportunity for others
        - [ ] Reflect on feedback
        - [ ] Energized by challenges
        - [ ] Applies lessons from past situations
        - [ ] **Delegation of work and managing time effectively for myself and for the team as a whole - identify full scope of project - estimate timeline - split resources - Figure out risks early - revealing unknowns - Setting up office hours for 1:1 discussions with engineers from my team and partner teams - making myself accessible opened doors for people to discuss/brainstorm stuff - I learnt more from follow-ups of things that were outside my scope - Hesitant at first - but good feedback from my sr. manager**
- [x] Tell me about a time you had to pivot mid project due to project requirements or changing expectations
    - [ ] Who made decision?
    - [ ] Any roadblocks?
    - [ ] End result?
    - [ ] Learnings?
        - [ ] Comfortable making decisions without full picture
        - [ ] Composure amidst ambiguity
        - [ ] Progress despite lack of structure
        - [ ] **EU regulations to make all books accessible by end of this year - Amazon set a goal to do it by Q1 of 2025 - Decision from the leadership without data points - text-based books makes sense - comics / manga - Hired a couple of engineers last year to fast track this - we didn’t have the whole picture what to do - iOS and Android - POC for google - file bugs and attend conferences - CSUN - LA - reaching out A11y experts at Amazon - understand their use cases and worked backwards**
- [x] Tell me about the most difficult working relationship that you’ve had
    - [ ] How did you address?
    - [ ] Outcome?
    - [ ] Learnings?
        - [ ] Open communication to resolve conflicts
        - [ ] Conflicts → opportunities
        - [ ] Find common ground
        - [ ] Use data to approach resolution
        - [ ] Respects and empathizes
        - [ ] **A manger from a different team keeps projects to himself instead of sending it to teams that's supposed to get it. - I can understand his thoughts process - to grow his team - we’ve shown consistent good performance with demos, all-hands, newsletter - instead of conflict - we decided to collaborate - expertise in each team - looped in my manager - being proactive to identify potential problems at this point is helpful to take initiative - collaboration with stakeholders like product managers with early prototypes**
- [x] faced pushback regarding your approach on a project
    - [ ] How did you address?
    - [ ] Outcome?
    - [ ] Learnings?
        - [ ] Open communication to resolve conflicts
        - [ ] Conflicts → opportunities
        - [ ] Find common ground
        - [ ] Use data to approach resolution
        - [ ] Respects and empathizes
        - [ ] **Why use KUX rendering engine instead of react? - **[https://quip-amazon.com/LDJJABhokRru/2024-KUX-Vision-KUX-as-a-Building-Block](https://quip-amazon.com/LDJJABhokRru/2024-KUX-Vision-KUX-as-a-Building-Block)
        - [ ] Presented at DevCon - teams outside Kindle were interested - 
- [x] Adopt an experimental approach to resolving something
    - [ ] What situation?
    - [ ] Approach?
    - [ ] Obstacles?
    - [ ] Result?
        - [ ] Same as “Tell me about a time you had to pivot mid project due to project requirements or changing expectations”
        - [ ] **Accessibility with Android native APIs - Talkback is open source - required reverse engineering due to lack of support from respective companies - used AI**
- [x] Leader asked you to do something that you didn’t view as the highest priority
    - [ ] How did you communicate?
    - [ ] Outcome?
        - [ ] Balances action and analysis to complete tasks
        - [ ] Delivers high quality and sustainable results
        - [ ] Rebounds quickly from setbacks
        - [ ] Takes accountability
        - [ ] **Build time optimization vs a new feature for PRH & Harper Collins**
- [x] Volunteered to take on an important portion of a critical project
    - [ ] Why critical?
    - [ ] Reason for volunteering?
    - [ ] Obstacles?
    - [ ] Communication?
    - [ ] Outcome?
        - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
        - [ ] **Eink waveform improvement - approaching deadline - ghosting - I had full picture - initial fix to unblock release - does the job, not very accurate - took 3 months to rearchitect**
- [x] needed to act quickly on something but didn’t have a clear idea on how to best proceed
    - [ ] Why quickly?
    - [ ] What info did you need to consider?
    - [ ] Learnings?
        - [ ] Same as “Tell me about a time you had to pivot mid project due to project requirements or changing expectations”
        - [ ] **Same Eink story**
- [x] explain tech concept to a non-tech audience
    - [ ] What concept? Audience? Approach for crafting? Ensure engagement? Outcome?
        - [ ] Clearly articulates relevant information
        - [ ] Communicates openly with team and collaborator
        - [ ] Keeps others informed within appropriate time frames
        - [ ] Demonstrates active listening
        - [ ] **Happens most of the time - Writing on Kindle with stylus - reading vs editing SDK - headcount - people with expertise - which team makes most sense to take ownership of a particular piece of this project - as the project progresses you need to craft emails specific to the audience - overall status of the project, required additional head count or cost allocation to leadership - triaging priorities with PM - coordinating launch timelines with program managers - test scenarios to QA - deep dive discussions with devs**
        - [ ] **Happens whenever I need to take up operational improvements for developers to leadership**
- [x] Needed to overcome a barrier in your work to achieve end result
    - [ ] Who were you working with? Communication?
        - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
        - [ ] **Foxit negotiation**
- [ ] Manage competing priorities to deliver a project
    - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
    - [ ] **Depends on the project**
        - [ ] Projects like rearchitecting 
- [ ] Significant setback and that forced you to reprioritize your work
    - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
- [x] a result you achieved for your team that you are most proud of
    - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
    - [ ] **Build time optimization**
- [ ] make a critical decision with missing or conflicting information
    - [ ] time to make decision? info you wished you had? outcome?
        - [ ] Same as “Tell me about a time you had to pivot mid project due to project requirements or changing expectations”
- [x] project you were on that grew in scope and timeline in an unexpected way
    - [ ] Same as “Tell me about a time you had to pivot mid project due to project requirements or changing expectations”
    - [ ] **Barolo launch**
- [x] What is your greatest development opportunity area?
    - [ ] steps to improve?
    - [ ] How do you believe improving in this area will impact you
    - [ ] How did you recognize this growth?
        - [ ] Same as “Tell me about a time that a peer or manager gave you a specific, actionable feedback for improvement”
        - [ ] **Delegation of work and managing time effectively for myself and for the team as a whole**
- [x] example of how you developed knowledge and learned about an area/product that you previously knew nothing about
    - [ ] Motivation?
    - [ ] How did you prioritize learning vs doing?
    - [ ] Applied these learnings?
        - [ ] Same as “Tell me about a time that a peer or manager gave you a specific, actionable feedback for improvement”
        - [ ] **A11y**
- [ ] took initiative to complete an important project for your team
    - [ ] Obstacles? Communication? 
        - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
- [ ] New skill set you grew in recent years helped you improve
    - [ ] How did you identify the need for this new skill set?
    - [ ] Applied to work how?
        - [ ] Same as “Tell me about a time that a peer or manager gave you a specific, actionable feedback for improvement”
- [ ] a late-breaking technical issue that blocked launch/release which was happening in a week or less
- [ ] a stakeholder disagreed with a process or approach that you or your team owned
    - [ ] How did you handle disagreement?
    - [ ] How did you find common ground?
        - [ ] Same as “Tell me about the most difficult working relationship that you’ve had”
- [ ] a project you were on failed to meet agreed upon requirements
    - [ ] What caused the project to fail to deliver as promised?
    - [ ] Same as “Leader asked you to do something that you didn’t view as the highest priority”
- [ ] you needed to push for a change that you knew would be unpopular with some people
    - [ ] How alleviate concerns?
- [ ] Tell me about a time you disagreed with a colleague and later found out your inital stance was not entirely correct
    - [ ] Same as “Tell me about the most difficult working relationship that you’ve had”
- [ ] skill set you developed after observing peers or mentors leveraging such skills
    - [ ] plan to learn how?
- [ ] How you balanced your own professional development with day-to-day demands of your role
- [ ] a project team member was not meeting expectations and how did you handle/address it
- [ ] a project where lack of clarity caused conflict on the teams you were working with and steps were taken to improve clarity and resolve the issue.

Inspiration from Apache spark’s wide vs narrow dependency -an improvement over google’s initial mapreduce design - to improve build time latency and save on cost


### Learn

- [x] Kibana since I know OLTP stuff
- [x] Redshift since I know OLTP stuff
- [x] Kindle - dual core - arm-based cortex process
- [x] Dev forum: 2 - Tech innovations?
    - [ ] assert for areas that we think should be non-reachable
    - [ ] Rendering AI - to talk to for tribal knowledge
- [x] processes for documenting lessons learnt and troubleshooting
- [x] invites feedback from team members
- [x] Revise - [https://quip-amazon.com/LDJJABhokRru/2024-KUX-Vision-KUX-as-a-Building-Block](https://quip-amazon.com/LDJJABhokRru/2024-KUX-Vision-KUX-as-a-Building-Block)
- [x] Why YJ?
