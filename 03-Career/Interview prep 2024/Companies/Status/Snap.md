---
base: "[[Status.base]]"
Status: Accepted
Assign: []
---
- [ ] [Job](https://careers.snap.com/job?id=Q125SWEB6)


L5 

Base salary: 500

team match end

1st round random engg

behavioral first 10 min

kind, smart, creative in the answer

40 min coding leetcode style

5 min - questions at the end

2 coding 

2 sys design

q&a

team match


Behavioral

- [ ] Why snap
- [ ] Why that particular team
- [ ] Print resume
- [ ] Resume related questions
- [ ] Talk about a time you demonstrated audacity
- [ ] Describe a time you made big difference
- [ ] Feature to improve snap

### Revise tomorrow

- [ ] Time complexity of graph questions

### 4/4 - phone screen

**Behavioral**

Time when you did something that no one else did

What would you go back and change

**Coding**

Given a list of people and their friends as an adjacency list, return the 1st and 2nd degree friends

Follow up - generalize to any degree

Check for corner cases - non existent friend

Imagine a read heavy scenario, what will you change in this case?




Mike and Vic - sys design

ad targeting 

youtube shorts

messenger

job scheduler

design scale

Q&A 30 min - ask the interviewer


1. ~~Walk through a typical day~~
2. Time spent putting out fires vs innovating or learning
3. Quarterly performance cycle
4. Teams present in same city vs distributed
5. ~~Culture - break fast and move fast vs ensuring highest quality~~
6. Career development opportunities
7. ~~Tech stack at Snap~~
8. ~~Mobility across teams or orgs within Snap~~


5/5 System design

Project you are most proud of

Build optimization

![[Screenshot_2025-05-06_at_9.58.42_AM.png]]


5/6 Coding

Tell me about a time when there was ambiguity in your project 

EAA - EU regulation - iOS and Android had rudimentary APIs ….

```javascript
#include <cmath>
#include <cstdio>
#include <vector>
#include <iostream>
#include <algorithm>
#include <stack>
using namespace std;

enum Action {
    pickup = 0,
    dropoff
};

// 1:30pm
// hh:mm
int getTimestamp(string timestamp) {
    int hours = (timestamp[0]-'0') * 10 + (timestamp[1] - '0');
    int min = (timestamp[3]-'0') * 10 + (timestamp[4] - '0');
    bool isAM = timestamp[5] == 'a';
    
    int totalMin = (hours % 12) * 60 + min;
    if (!isAM) {
        totalMin += 12 * 60;
    }
    return totalMin;
}


int calculateActiveTime(vector<string>& timestamp, vector<Action>& action) {
    int n = timestamp.size();
    int start = getTimestamp(timestamp[0]);
    int end = getTimestamp(timestamp[n-1]);
    
    stack<int> st;
    st.push(start);
    
    int idleTime = 0;
    
    int lastWorkingTimestamp = 0;
    for (int i = 1; i < n; i++) {
        int curTimestamp = getTimestamp(timestamp[i]);
        if (action[i] == dropoff) {
            st.pop();
            lastWorkingTimestamp = curTimestamp;
        } else {
            if (st.empty()) {
                idleTime += curTimestamp - lastWorkingTimestamp;
            }
            st.push(curTimestamp);
        }
    }
    return end - start - idleTime;
}

// # 9:30am | pickup
// # 10:10am | dropoff
// # 11:20am| pickup
// # 1:15pm| pickup
// # 1:45pm| dropoff
// # 3:25pm | dropoff




int main() {
    vector<string> timestamp = {"09:30am", "10:10am", "11:20am", "01:15pm", "01:45pm", "03:25pm"};
    vector<Action> actions = {pickup, dropoff, pickup, pickup, dropoff, dropoff};
    
    cout << getTimestamp("12.30pm") << endl;
    
    cout << calculateActiveTime(timestamp, actions) << endl;
}
// # You are given a series of timestamps and actions of a food delivery driver. Return the active time of the driver.

// # Active time: Total time working minus the idle time of the driver.
// # Idle time: driver has No deliveries at hand, all items have been dropped off at the moment and the driver is waiting for another pickup. 

// # Notes:
// # * Drop off can only happen after pickup
// # * 12:00am means midnight, 12:00pm means noon. 
// # * All timestamps given are within a day.

// # Example: 

// # Timestamp(12h) | Action

// # 9:30am | pickup
// # 10:10am | dropoff
// # 11:20am| pickup
// # 1:15pm| pickup
// # 1:45pm| dropoff
// # 3:25pm | dropoff

// # total time = 3:25pm-9:30am = 355 mins;
// # idle time = 11:20am-10:10am = 70 mins;
// # active time = total time-idle time = 355-70 = 285 mins;

```

How would you scale if there multiple drivers?

5/7

Coding

Why snap?

Check if a string exists given a list of strings

How will you handle multibyte characters?

How will you handle fuzzy match?

How will you scale this to billions of words?

Design

What is an experimental approach you took?

![[Screenshot_2025-05-07_at_12.01.04_PM.png]]

### Snap system design prep

9. Snap Discover and Story System
10. Map tagging
11. Favorite Stickers and Stickers Recommendation system
12. Bitmoji like System how you will scale personalise stickers when user is around 500M+
Above what i did before my interview
13. ad insertion & delivery in stories
14. Design Yelp

4/15 

Project you are most proud of

You are an NGO running a donation campaign - Kim Kardashian is promoting your campaign - design a system that will accept payment from the user.

![[Screenshot_2025-05-15_at_12.07.56_PM.png]]


5/27 - call with Tina

Passed the interview

L5

Make a decision this week with Meta

Team match might be delayed

2 weeks or 2 months 

Maximum 6 months

Handful of people in the queue

No formal email

Team match based on years of experience and resume

Backend teams

Keep in touch 

Send updated resume

Can there be a case I'm never matched in 6 months

9/8 - team match

Core infra team

- [x] How many team members and their tenure
- [x] In person vs remote engineers 
- [x] How many senior engineers and staff engineers
- [x] Open positions
- [x] Collab with other teams like product or ML
- [x] Oncall load
- [x] 3 year roadmap
- [x] Core features vs migration efforts
- [x] Stale infra vs new infra
- [x] Monolith to multi cloud what contribution
- [x] Biggest challenges the team is tackling this year
- [x] What will I work on if I join?
- [x] Work life balance like


- [x] Core features vs migration efforts
- [x] Deep staxk
- [x] Stale infra vs new infra
- [x] Delivery quality vs taking shortcut because of deadline pressure
- [x] Oncall load
- [x] Midnight wake up during oncall
- [x] Growth into the next level
- [x] Attrition rate
- [x] Tech stack and languages


9/16 - offer call

- [x] Role & level - Backend engineer L5
- [x] 6+ yoe listed vs 8 
- [x] Base salary - $209 - $313
- [x] Bonus
- [x] Equity 
- [x] Refreshers and what cycle 
- [x] Benefits
- [x] Start date options
- [x] How long to decide
- [x] Location - Bellevue or Seattle
- [x] Relocation or remote policy

### Pros

15. Interesting work 
16. Good culture 

### Cons

17. Stressful
18. Volatile stock

swe - seattle

12/1

base - 250k

equity - 296875

new hire + quarter

new hire - 482422 → 54, 33, 13 - feb price - mar vest

catch up in equity - jan

quarter - meet expectations - not locked-in - quart perf review - 25% - 74218 * 4 aug nov feb closing price - 

outperformance equity - reward hardest workers - 

top performer - 12.5% of comp

exceeding expectation - 6.25%


$34 

150 - wellness

401k - 100% - 3%

Unlimited PTO

15 sick

mental support
