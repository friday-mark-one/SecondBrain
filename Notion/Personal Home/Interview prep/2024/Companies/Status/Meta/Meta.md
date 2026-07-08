---
notion-id: 17302d25-148c-80eb-aab7-c9bb90d00f22
base: "[[Status.base]]"
Status: Rejected
Assign: []
---

## Round 1

- [ ] [Software Engineer, Realtime Engine Technology - Reality Labs](https://www.metacareers.com/jobs/393460090372514/)
- [x] [Software Engineer, OS Frameworks - Reality Labs](https://www.metacareers.com/jobs/664154108996872/)
- [ ] [Software Engineer, Infrastructure](https://www.metacareers.com/jobs/804955741151464/)
- [x] [Graphics Software Engineer, Rendering - Reality Labs](https://www.metacareers.com/jobs/276174232022648/)
- [x] [Software Engineer, Product](https://www.metacareers.com/jobs/956416182442485/)
- [ ] [Software Engineer, Server Efficiency](https://www.metacareers.com/jobs/448764311368585/)


## Round 2

- [ ] [Software Engineer, Infrastructure](https://www.metacareers.com/jobs/1408007706638053/)
- [x] [Software Engineer, Server Efficiency](https://www.metacareers.com/jobs/448764311368585/)
- [x] [Software Engineer, Infrastructure](https://www.metacareers.com/jobs/804955741151464/)
- [x] [Software Engineer, Realtime Engine Technology - Reality Labs](https://www.metacareers.com/jobs/393460090372514/)
- [ ] [Software Engineer, Product](https://www.metacareers.com/jobs/750778856583126/)
- [ ] [Software Engineer, Machine Learning](https://www.metacareers.com/jobs/917648072656133/)


Candidate is an experienced lead software engineer at Amazon with around 8 years of experience in large-scale systems with expert C++ knowledge. This experience is directly transferable to Meta's backend systems comprising of numerous C++ services. I have first-hand knowledge of the candidate's technical strengths as I have collaborated on several personal side projects.

## Recruiter call

- [ ] Background
    - [ ] Role in current job
    - [ ] Responsibilities
    - [ ] Technologies used
- [ ] Questions about the role you are applying
- [ ] Experience
    - [ ] with a particular library
- [ ] Long-term goals
- [ ] Interest in working here
    - [ ] Why Meta?

tech screening - zoom

1 hour long


2 coding and system design

OCI core values


## Google form

**Imagine you're chatting with the hiring manager... In 3-5 sentences, please describe a summary of background, work experiences, expertise, interesting projects, and/or responsibilities.  #elevatorpitch**

Seasoned software engineer with 8+ years of expertise in C++, specializing in developing robust low-level SDK libraries and architecting scalable, high-performance application software.

Worked in several teams across Amazon's Kindle org including building low-level SDK APIs, scaling book ingestion pipeline, optimizing rendering engine and architecting consumer facing desktop and mobile applications.

Interesting projects that had me excited were redesigning E-ink waveform architecture that involved working closely with kernel developers and supporting accessibility features for Kindle users on Android/iOS.

Responsible for identifying strategy for specific goals, establishing the right short-term vs long term trade-offs with stakeholders, delivering projects independently, providing feedback and support to unblock partner teams and mentoring SDEs.

**Using percentage to allocate your responsibilities amongst these: Time Coding vs. Design vs. Leadership vs. Mentoring**

Coding: 30-40%, Design: 30%, Leadership: 20-30%, Mentoring: 10%

**Describe a recent project you led and your role in the design/architecture process?**

Spearheaded a cross-functional team of 3 engineers to redesign E-ink waveform architecture to eliminate ghosting and make quicker rendering transitions (page turn performance improved by 12%). I was responsible for proposing the overall strategy, prototyping, seeking stakeholders’ approval and driving the efforts in core rendering engine.

**How involved are you in roadmapping/inception of the design vs implementation?**

Depending on the ambiguity of the project, majority of my time is spent in identifying a strategy and designing the system, overseeing / providing feedback / unblocking members of my team and partner teams. I delegate unambiguous chunks of a project to members of the team and provide direction.

**For tech decisions, where do you get approval? When do you typically get guidance?**

For tech decisions, I get approval from Senior SDEs from partner teams, Principal Engineers (PE) overseeing multiple teams, Product Managers (PM) and Bar Raisers (BR) for customer facing projects. I seek guidance from respective team leads and PEs depending the complexity and impact of the project.

**What are your main motivations to make a career change?**

I'm looking for fresh challenges and opportunities to grow my skill set in a rapidly evolving landscape. I admire Meta's reputation for pioneering innovative projects that push the boundaries of cutting-edge technology, and this aligns perfectly with my career goals and values. I'm excited about the prospect of contributing to an environment that fosters continuous learning and innovation.

**Do you currently know anyone working at Meta who could be a professional reference for you? no worries if not**

Vaidyanathan P K



## Questions

- [ ] layoffs?
    - [ ] Has the hiring rate decreased?
    - [ ] Job security
- [ ] Team match with multiple options? Because of the new recruitment process change?
- [ ] Interview specific to ML or generic?
- [ ] What stood out in my resume?
- [x] What roles are in demand right now?
- [x] Do you oversee recruitment for other roles?


Parallels with ML

- [ ] Skia graphics - uses GPU
- [ ] C++ for compute efficiency and Python for scripting
- [ ] Deployment of the build with A/B testing

## Recruiter call minutes (2/12)

work auth email

tech phone interview

2 coding questions - prep material will be sent over

leetcode med & hard

March 5 - 7

9 - 11 AM

More details later

Final round - 4 loops 45min each

2 coding

1 behavioral

1 system design

Team match 

2 options

1. revenue acceleration - under monetization (no manager for 3 months) - then narrow down to 1 team
2. Talking to teams and match


### Recruiter call (3/19)

Everything is in the email - Preparing for your Full Loop Interviews at Meta

Choose between system design and product design

### Recruiter call (4/1)

Excalidraw - warm-up

Broad prompt

Scaling system, perf, availability, efficiency

Reduce ambiguity in prompt

aligned with what problem to solve

write them down on excalidraw - before getting to solution

tradeoff

testability, usability, portability, maintainability, operationalability

drive the conversation

potential failure points, strengths and weaknesses

active engagement

Signal

Hellointerview

[[Facebook SWE screen]]

[[Facebook SWE coding]]

[[Facebook Design]]

[[Facebook SWE behavioral]]

Interview (4/28)

Coding

3. Check if string is a palindrome - a man a plan a canal Panama
4. Given cwd and cd path print new path

```javascript
#include <iostream>
using namespace std;

// To execute C++, please define "int main()"
int main() {
  auto words = { "Hello, ", "World!", "\n" };
  for (const char* const& word : words) {
    cout << word;
  }
  return 0;
}

// hello

/*
Write a function that returns true if a given string is a palindrome (a 
palindrome is a string that is the same when reversed, if you ignore
punctuation and capitalization).  Some examples of palindromes are:
  "Race car!"
  "A man, a plan, a canal, Panama!"
*/


bool isAlpha(char c) {
    return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}


char toLower(char c) {
    if (c >= 'A' && c <= 'Z') {
        c = c - 'A' + 'a';
    }
    return c;
}

bool isEqual(const string& input, int x, int y) {
    return toLower(input[x]) == toLower(input[y]);
}

// "A man, a plan, a canal, Panama!"
bool isPalindrome(const string& input) {
    int n = input.length();

    int start = 0;
    int end = n-1;

    while (start < end) {
        while (start < end && !isAlpha(input[start])) {
            start++;
        }

        while (start < end && !isAlpha(input[end])) {
            end--;
        }

        while (start < end && isAlpha(input[start]) && isAlpha(input[end])) {
            if (isEqual(input, start, end)) {
                start++;
                end--;
            } else {
                return false;
            }
        }
    }
    return true;
}

/*
Implement a mock of cd (change directory) command on Unix. The code doesn't have to change actual directories, just return the new path after cd was executed.

The function takes two arguments (current working directory and directory to change to), and returns the output directory as if cd command was executed. There's no filesystem underneath; all paths are valid.

Example table of inputs and outputs:
| cwd      | cd (arg)       | output
| -------- | -------------- | ------
| /        | foo            | /foo
| /baz     | /bar           | /bar
| /foo/bar | ../../../../.. | /
| /x/y     | ../p/../q      | /x/q
| /x/y     | /p/./q         | /p/q
*/

string getNewPath(const string& cwd, const string& cdPath) {
    stack<string> st;

    bool clearStack = false;
    if (cdPath.length() != 0 && cdPath[0] == '/') {
        clearStack = true;
    }

    if (!clearStack)
    {
        stringstream ss(cwd);
        string dir;
        while (getline(ss, dir, '/')) {
            if (dir.length() != 0)
                st.push(dir);
        }
    }

    {
        stringstream ss(cdPath);
        string dir;
        while (getline(ss, dir, '/')) {
            if (dir.empty()) {
                continue
            }
            if (dir == ".." && !st.empty()) {
                st.pop();
            } else if (dir == ".") {
                // no-op
            } else {
                st.push(dir);
            }
        }
    }

    string newPath = "";
    while (!st.empty()) {
        newPath += st.top() + "/";
        st.pop();
    }

    if (newPath.length() == 0) {
        return "/";
    }

    reverse(newPath.begin(), newPath.end());
    return newPath;
}
```

Design

Design ad click aggregator with near real time reporting 

![[Screenshot_2025-04-28_at_11.48.28_AM.png]]

Interview (4/30)

Coding

5. Max sum of 2 non-adjacent numbers in an array
6. Evaluate an expression containing digits, addition and multiplication symbols - 2*3+4

Behavioral 

Project you are most proud of

Took the initiative yourself?

Decision that you didn't agree with that had an impact on you

Improvement feedback from manager or peer

Do you mentor people


Feedback from references

Ajay

Hobby projects - 8 years

Myer’s diff algorithm - implemented from research paper - no helpful guidance on the internet

Curious learner


Vaidy

Interned at Amazon - 2016

Full-time PPO - 2017

Promoted to SDE2 in less than 2 years

I also remember attending one of your tech session - consistent hashing (I think) - maybe a datapoint for learn and be curious

Pasting relevant stuff from my resume that I did back in Chennai that you could use if they are asking for specific projects

**Technical**

- Optimized core book processing libraries by resolving bottlenecks with **JProfiler** which brought down p50 copy-paste time in[ Kindle Create](https://www.amazon.com/Kindle-Create/b?ie=UTF8&node=18292298011) (an ebook editing tool) from **5000 ms to 340 ms**
- Built the **thumbnail rendering engine** for[ Kindle Publisher tools](https://www.amazon.com/gp/feature.html?ie=UTF8&docId=1000765261) with** **memory efficient** **on-demand** **loading using **Qt framework in C++ **which cut down proof-reading workflow duration by 70%

**Leadership**

- **Renegotiated SLA** with Foxit Software Inc. by developing a **benchmarking test suite**, ensuring high-quality builds and enabling faster validation cycles with bi-weekly releases
- **Mentored multiple SDEs** across teams and guiding them toward promotions and professional growth
- Actively participated in SDE hiring and **conducted 40+ technical interviews**
