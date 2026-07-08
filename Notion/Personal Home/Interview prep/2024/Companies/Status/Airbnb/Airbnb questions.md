---
notion-id: 22c02d25-148c-8031-9a91-f142af897105
---

1. [https://leetcode.com/discuss/post/6717917/airbnb-technical-screen-interview-senior-fzjk/](https://leetcode.com/discuss/post/6717917/airbnb-technical-screen-interview-senior-fzjk/)
    1. Property Booking Optimizer
Given:
    - A list of properties where each property has (id, neighborhood, capacity)
    - A group size (number of people that need accommodation)
    - A target neighborhood
Goal:
Find the optimal combination of properties in the given neighborhood that can accommodate the group with these rules:
    2. Total capacity must be >= group size
    3. Choose the combination with minimum total capacity that exceeds group size
    4. If multiple combinations have same capacity, choose the one with fewer properties
    5. If no valid combination exists, return empty list
Examples:
Example 1:
Properties:
    - (1, "area1", 5)
    - (2, "area1", 3)
    - (3, "area1", 2)
    - (4, "area2", 4)GroupSize = 5, neighborhood = "area1"Output: [1] // Property 1 alone has capacity 5, which is optimal
Example 2:
Same properties, GroupSize = 6, neighborhood = "area1"
Output: [1, 3] // Properties 1+3 give capacity 7, which is minimal solution
Example 3:
Properties:
    - (1, "area1", 5)
    - (2, "area1", 3)GroupSize = 10, neighborhood = "area1"Output: [] // No combination can accommodate 10 people

2. [https://leetcode.com/discuss/post/6467985/airbnb-tps-by-anonymous_user-5sb6/](https://leetcode.com/discuss/post/6467985/airbnb-tps-by-anonymous_user-5sb6/)
I got leetcode (3076. Shortest Uncommon Substring in an Array) with different form of input
and output was expected in different way.
eg
// star_wars_titles = [
// 'The Phantom Menace',
// 'Attack of the Clones',
// 'Revenge of the Sith',
// 'A New Hope',
// 'The Empire Strikes Back',
// 'The Return of the Jedi',
// 'The Force Awakens',
// 'The Last Jedi',
// ]
// Then the smallest unique substring you could type in to specify each is:
// {
// 'The Phantom Menace': 'to',
// 'Attack of the Clones': 'tt',
// 'Revenge of the Sith': 'v',
// 'A New Hope': 'ho',
// 'The Empire Strikes Back': 'b',
// 'The Return of the Jedi': 'u',
// 'The Force Awakens': 'aw',
// 'The Last Jedi': 'tj',
// }

3. [https://leetcode.com/discuss/post/6384132/airbnb-sse-onsite-by-anonymous_user-ki91/](https://leetcode.com/discuss/post/6384132/airbnb-sse-onsite-by-anonymous_user-ki91/)
given a list of menu items, how would you pick the most cost optimal option - [ 8.0 : "pizza",
9.0: "pasta",
10.0: "pizza, pasta",
11.0:"burger",
12.0:"burger, pizza, pasta"
]
order is [burger, pizza] and the answer should be 12.0 ["burger", "pizza", "pasta"]

4. [https://leetcode.com/discuss/post/6384063/airbnb-onsite-by-anonymous_user-37mj/](https://leetcode.com/discuss/post/6384063/airbnb-onsite-by-anonymous_user-37mj/)
    1. given a list of menu items, how would you pick the most cost optimal option - [ 8.0 : "pizza", 9.0: "pasta", 10.0: "pizza, pasta", 11.0:"burger", 12.0:"burger, pizza, pasta" ] order is [burger, pizza] and the answer should be 12.0 ["burger", "pizza", "pasta"]

5. [https://leetcode.com/discuss/post/5887039/airbnb-g8-offer-by-anonymous_user-e2fw/](https://leetcode.com/discuss/post/5887039/airbnb-g8-offer-by-anonymous_user-e2fw/) 
1st round:
Screening: Find next Biggest Pallindrome.
2nd Round:
topological sort related question: Complete next sequence type of variant.
3rd round:
System design: Slot Booking system and a lots of followups
4th round:
HM. General discussion around experience.
Cultural fit:
Recruiter would prep you.

6. [https://leetcode.com/discuss/post/5704823/airbnb-senior-onsite-by-anonymous_user-bbvd/](https://leetcode.com/discuss/post/5704823/airbnb-senior-onsite-by-anonymous_user-bbvd/) 
    2. Code Review: Python
Go read this repo to get context for the overall project: [https://gist.github.com/airbnb-robot/af6e9068639733bff79d4e3773a8d1dc](https://gist.github.com/airbnb-robot/af6e9068639733bff79d4e3773a8d1dc)
There are 3 pull requests: 1, 2, 3
They are in increasing order of complexity and difficulty.
You get a GitHub repo with 3 pull requests. What they don't tell you is that you score "points" for making comments on various issues about the code. Apparently I got a few points below the cutoff for senior software engineer. I got all the low-hanging fruit in the easier pull requests, but I ran out of time on the bigger pull request.
For this interview, start with pull request 3 and make as many comments about the architecture as you can. Apparently the last pull request is worth the most points.
Pull request 1:
This pull request is to fix the wrong type of consistency being sent through the API. The two types are "EVENTUAL" and "STRONG", but someone wrote "WEAK" and "STRONG", which caused a bug. This pull request fixes the bug.
Things to note:
    - Use Enums instead of the list ["EVENTUAL", "STRONG"] to check the value being sent.
    - Ask about casing.
    - Ask the user to test all possible conditions for the enum value.
    - Python should use f-strings instead of interpolations wherever possible.
    - Ask the user to log whenever there's an error or add instrumentation and alerting. We should log the actual exception and NOT swallow the exception.
    - Ask whether we have overall system tests.
Pull request 2:
For this PR, we add a DAO layer to fetch listings data from the listing service and host data from the hosts service. In order to do so, we first need to issue service calls to those services and then transform the raw responses into our internal DAO objects for related processing.
    - There's a bug between the Listing and the Listings objects when you try to turn a Listing into Listings. If you update a field in Listing and it's not in Listings, then you'll have a key error when you try to do the transformation. Use dict.get(key) instead of dict[key].
    - Look at the DAOs that are used. They are frozen data classes in Python. Add slots to them. This improves query performance and reduces memory usage.
    - You should reraise exceptions and avoid ambiguous, catchall exceptions.
    - Ask the user to add unit tests for the retries.
    - The retry classes are very similar. You should ask the user to make a base classes with the common functionality.
    - The type hinting for some of the data classes is incorrect. `x: datetime = None` should actually be `x: Optional[datetime] = None`.
    - Different exceptions should be handled in different ways. You should not treat every Exception the same way.
    - Suggest using async-await in some places for better performance.
    - If the listing service gives you a different number of results from what you expected, then you should log the difference between what you expected and what you got.
    - The logging should use static strings with extra parameters instead of dynamic, interpolated strings.
Pull request 3:
Atlantis has told us that we're calling their API too frequently and they have a batch endpoint that they'd like for us to use instead. To get the status of many reservations and take advantage of this, we will start batching up our calls to Atlantis to make this work without changing our external API. We plan to use a job queue for registrations and listings. Once the queue is large enough or after enough time has passed, we'll pick a bunch of items off this queue.
    - Leave a general comment saying that you should talk to Atlantis to get a precise rate limit or find out what the problem is. This is a Staff+ level signal.
    - Leave a comment saying that we should look for distinct listings and registrations instead of a list, which may have duplicates. This is a Staff+ level signal.
    - Ask what the traffic is from AirBnb to the city of Atlantis. Maybe this isn't the right approach?
    - Ask whether the queue is durable. Maybe you can use a different data structure instead. Maybe you can sync every few hours instead of every 500 events.
    - Use a `list(set(registration_numbers))` instead of a `list(registration_numbers)`
    - Do a bulk upload to YOUR databases instead of sequential updates.
    - Use better type hinting in the Python. Some methods don't have return types explicitly stated.
    - We should not have silent failures whenever we try to add jobs to the queue.
    - Run the queue using an external job instead of from the code layer.
    - The dequeuing code is not thread safe. You could try to send the same exact request from the queue multiple times.
    - Magic constants spread throughout the file.
    - The way the queue is set up, you will have data loss after 500 events have been added. You need to fix this.
    3. System Design
This interview was highly structured. The interviewer began talking a lot, and I started asking questions about what he was saying. He got a little confused or frustrated, and then he told me he will just paste the question. His English was also pretty bad.
    - Create a group chat
    - Create an inbox, load the top 10 group chats that have the most recent messages for the user
    - Send a message to the group chat
    - Show messages of a group chat
I asked a lot of questions like:
    - do we need to delete chats for users if they request account deletion?
    - Do we need to consider security or admin tooling for the chat
He told me not to worry about any of that and just answer the 4 questions.
He was very interested in my data schema.
Cassandra and similar databases are just a waste. You don't need the write throughput.
The main question is SQL vs Non-Relational. He said the traffic is about 1 million group chats per year, assume 20 messages per group chat. That's 5500 messages / day, which is 228 messages / hour.
SQL can definitely handle that. BUT you don't need the strong consistency. It's probably to have high availability and easier horizontal scalability, so I went with DynamoDB.
My interviewer had ABSOLUTELY NO IDEA how DynamoDB worked. He didn't know about partition keys, sort keys, or secondary indices. I basically wrote my data schema AS IF it were SQL, which felt strange.
He asked me to walk through what happens in my system for each of the 4 workflows.
Group chat - easy.
Just create an entry in your group_chat table and corresponding entries in your chat_user table.
Create an inbox and load the top 10 group chats.
Simple - when the user logs in, you just query the top 10 most recently updated chats.
Consider this schema
group_chat
id: INT PK
created_at: datetime
last_modified_at: datetime (idx)
[Can also use a DB trigger to update last_modified_at.]
chat_user
id: INT PK
user_id: INT (idx, FK references user.id, ON UPDATE CASCADE, ON DELETE CASCADE)
group_chat_id: INT (idx, FK references group_chat.id, ON UPDATE CASCADE, ON DELETE CASCADE)
created_at: datetime
message
id: INT PK
sender_id: INT (idx, FK references user.id, ON UPDATE CASCADE, ON DELETE CASCADE)
message: varchar(500)
created_at: datetime
Whenever you write a message, you should use a producer-consumer model. The consumer should update the last_modified_at timestamp when you write a message in that group chat.
Send a message in the group chat.
I asked him whether we expect to send the message to the users who are online, or whether it should just show up next time the user refreshes their page. He said we want to push it.
Simple - I immediately said there were two paths:
    4. Saving the message in the database and making it ready to load for the people who were NOT CURRENTLY ONLINE.
    5. Pushing the message to active users.
He told me to ignore the second path. It was strange, because that one is pretty important.
For #1, do the following
User ----message----> [Chat Server] ---message---> Kafka ---message---> Consumer
The consumer (1) Writes the message to the message table, (2) Updates the group_chat table, and (3) delivers the message to the other online users (he said to ignore this) using at-least-once-delivery.
Show messages of a group chat
This is an easy query when you click a group chat. It just loads the most recent messages.
Follow up:
What if we want to create groups of users and refer back to the existing groups whenever the same group makes another reservation?
Simple.
New Tables:
Group:
Id INT PK
signature: text (idx)
created_at: datetime
group_member:
Id INT PK
user_id INT (idx) fk references ...
group_id: INT (idx), fk references group.id
created_at: datetime
Sort the user_ids and make a key out of the concatenated user_ids. This will be the Group.signature
E.g. if users 1, 2, 8 are in the group, then the key is "1,2,8"
If you want to see if users 2, 8, 1 have ever formed a group before, then you look for the key
"1,2,8"
Then change the chat_member table to reference groups instead of users.
Follow Up 2:
How do you deliver the messages to users who are actively online.
Go look at any system design for WhatsApp. Just use Redis + chat servers + messaging queues.
Follow Up 3:
How do you scale the system if you're creating 1,000,000 group chats per day?
DynamoDB horizontally scales REALLY WELL. Etc. etc.
---
    6. Project Deep DiveI guess the interviewer customizes all his questions based on the project you choose.
Talk about a big project you were a part of.
Why were you chosen to lead it?
What were the steps you chose to implement it and why?
Talk about the other teams you worked with.
Talk about implementation details.
How long did it take, how many people did you lead, and what were the challenges/
How did you define milestones and distribute work?
How do you delegate work and make people successful vs. managing the overall timeline?
What challenges did you have?
What did you learn?
What compromises did you have to make with the product manager's vision?
What issues did you have with other teams?
How did you maintain high quality, especially during the rollout?
(Testing, Monitoring, alerting, rollout strategy)
I talked about leading an international payments project where I worked with payment service providers, legal teams, privacy teams, other engineering teams etc. and mentored a few engineers on my team.
I talked about how I like to divide up project work on projects that I lead. I said that I like to ask individual engineers if there are any specific opportunities that they want during the project. I also ask their managers if there are opportunities that they need to address or any areas where they could show signals since it could help in their performance reviews.
For my project, I talked about how I led an international payments project. I led a team of 4 and was also helping mentor a senior engineer. Our manager said he had botched a previous project that had a bad launch. Apparently he didn’t anticipate certain workflows when getting requirements or designing his last project, so I talked about how I made sure he got the opportunity to design some of our reconciliation workflows for the billing and payments engines.
For a mistake that I made, I talked about how I designed the database for the requirements that I got from the PM and from my partner teams. After we launched, our customers complained about how slow data access was, and apparently one of the workflows we missed involved business reporting. I had asked the other teams to review my data model, but what I should have done is ask what queries they will need to run and what those queries will be used for. Ultimately, other teams had been doing scatter-gather queries over all the shards to access data. I rectified this by proposing a few ideas, discussing tradeoffs, and then favoring a data warehouse given our needs and future scale.
There's obviously way more detail in there, but I'm not going to type out everything.
Hiring manager feedback - D.C. said I communicated very clearly, but that I have no sense of accountability or humility and that I spoke poorly of coworkers and treated them like "low performers" (his words, not mine).
He also apparently spoke against me in the onsite debrief and didn't want me to join even at the G8 (~Software Engineer II) level. That is crazy. I have never had an issue in behavioral/eng. experience interviews before. This feels malicious.
---
    7. Coding
```sql
You are given an array like [5, 4, 3, 2, 1, 3, 4, 0, 3, 4]

Part 1:
Print a terrain where each number represents the height of a column at that index.

+
++    +  +
+++  ++ ++
++++ ++ ++
+++++++ ++
++++++++++ <--- base layer
```
Part 2:
Imagine we drop a certain amount of water at a certain column. The water can flow in whichever direction makes sense. Print the terrain after all the water has fallen.
`
dumpWater(terrain, waterAmount=8, column=1)

Should render
+
++WWWW+  +
+++WW++ ++
++++W++ ++
+++++++W++
++++++++++ <--- base layer`

7. [https://leetcode.com/discuss/post/5463184/airbnb-phone-screening-by-anonymous_user-efde/](https://leetcode.com/discuss/post/5463184/airbnb-phone-screening-by-anonymous_user-efde/) 
Create a simple implementation of the "4-in-a-row" game, also known as Connect Four. This game involves two players who take turns dropping their colored discs from the top into a seven-column, six-row grid. The objective is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs.
from collections import deque
class ConnectFour:
def **init**(self):
self.board = [[' ' for _ in range(7)] for _ in range(6)]
self.current_player = 'X'
```python
def print_board(self):
    for row in self.board:
        print('|'.join(row))
        print('-' * 13)

def is_valid_move(self, col):
    return self.board[0][col] == ' '

def make_move(self, col):
    for row in reversed(self.board):
        if row[col] == ' ':
            row[col] = self.current_player
            return True
    return False

def switch_player(self):
    self.current_player = 'O' if self.current_player == 'X' else 'X'

def check_winner(self):
    # Check horizontal, vertical, and diagonal lines for a winner
    for row in range(6):
        for col in range(7):
            if self.board[row][col] == ' ':
                continue

            # Check horizontal (left to right)
            if col + 3 < 7 and all(self.board[row][col + i] == self.board[row][col] for i in range(4)):
                return self.board[row][col]

            # Check horizontal (right to left)
            if col - 3 >= 0 and all(self.board[row][col - i] == self.board[row][col] for i in range(4)):
                return self.board[row][col]

            # Check vertical
            if row + 3 < 6 and all(self.board[row + i][col] == self.board[row][col] for i in range(4)):
                return self.board[row][col]

            # Check diagonal (left to right)
            if row + 3 < 6 and col + 3 < 7 and all(self.board[row + i][col + i] == self.board[row][col] for i in range(4)):
                return self.board[row][col]

            # Check diagonal (right to left)
            if row + 3 < 6 and col - 3 >= 0 and all(self.board[row + i][col - i] == self.board[row][col] for i in range(4)):
                return self.board[row][col]
    return None

def is_full(self):
    return all(self.board[0][col] != ' ' for col in range(7))

def play_with_moves(self, moves):
    print("Welcome to Connect Four!")
    self.print_board()
    for col in moves:
        if col < 0 or col > 6 or not self.is_valid_move(col):
            print(f"Invalid move: {col}. Try again.")
            continue

        self.make_move(col)
        self.print_board()

        winner = self.check_winner()
        if winner:
            print(f"Player {winner} wins!")
            return
        if self.is_full():
            print("The game is a draw!")
            return

        self.switch_player()

    print("No winner or draw. Game ended.")
```
    # **Example usage**
moves = [0, 0, 1, 1, 2, 2, 3] # A sequence of moves leading to a win for player 'X'
game = ConnectFour()
game.play_with_moves(moves)

8. [https://leetcode.com/discuss/post/5333931/airbnb-phone-screen-senior-sde-by-anonym-t95y/](https://leetcode.com/discuss/post/5333931/airbnb-phone-screen-senior-sde-by-anonym-t95y/) 
Phone screen - Was asked variation of
[https://leetcode.com/problems/minimum-window-substring/](https://leetcode.com/problems/minimum-window-substring/)

9. [https://leetcode.com/discuss/post/1501590/airbnb-oa-how-to-solve-by-anonymous_user-b96m/](https://leetcode.com/discuss/post/1501590/airbnb-oa-how-to-solve-by-anonymous_user-b96m/) 
    8. Perfectly contained BSTNode

10. [https://leetcode.com/discuss/post/3029071/airbnb-se-question-by-jmaster28-4qsm/](https://leetcode.com/discuss/post/3029071/airbnb-se-question-by-jmaster28-4qsm/) 
    9. Does anyone understand what this question is asking?I noticed it's one of Airbnb's questions they ask during SE interview.
Problem: given a list of leaf nodes in a pyramid ，and a map which indicates what's the possible parent node given a left and right node. Return true if the one of leaf node could turn into the root node, Otherwise, return false.
Example:Example:
root/ \X   X/\  /\X  X  X/ \/ \/ \A   B  C  DMap:
 left:        A |  B   |   C | Dright---------------------------------A             B |A or C|   D | AB             D |B or C|   A |C                              BDNote:1. If left child is B, right child is A, the parent node could be B or C
I heard it's supposed to be similar to https://leetcode.com/problems/pyramid-transition-matrix/description/

11. [https://leetcode.com/discuss/post/2785776/airbnb-sde-2-india-offer-by-anonymous_us-uum7/](https://leetcode.com/discuss/post/2785776/airbnb-sde-2-india-offer-by-anonymous_us-uum7/) 
    10. Background:YEO : 5
I applied through their careers page and received a call month after that in September. The recruiter told me that they have an urgent opening.
1. Take home coding roundSeptember last weekIt was conducted on HackerRank or HackerEarth. Don't remember exaclty.
Input: [[1,2,3], [2,4,5], ....]There is a tree structure given in format of [Parent, left child, right child]. Find weather it is valid Binary Search Tree or not. If it is, return the root node of the tree.
Recruiter reached out to me after couple of days and onsite 2 coding rounds were scheduled for the next week. After many re-schedules from the interviewers side, it happened on 1st week of October
2. First RoundStandard Target sum, but all values were double. The Target sum and the coins values as well. Also the question was framed in some kind of story, but took hardly 5 mins to find that it is target sum problem.
3. Second Roundhttps://leetcode.com/problems/maximum-profit-in-job-scheduling/
Received feedback for this next week(2nd week), as the second round was done on Friday and next rounds were scheduled for 3rd week of October. For this also, there was lot of re-scheduling from their side.
4. Past Experience RoundTheir was a expressionless senior guy, who asked all about past work. Didn't ask to draw anything (the architecture).
5. System Design RoundDesign Group messaging Service. He mostly focused on DB and the entitites which I'll store. I gave solution similar to this:https://bytebytego.com/courses/system-design-interview/design-a-chat-system
After a couple of days of silence, received positive feedback for all the previous rounds. Than they scheduled 2 core value rounds.
6. Core Values Rounds (1 & 2, 30 mins each)Why Airbnb?Have you ever helped someone who felt not beloging to the group? Why did you help that person (I was like arrrghhhh, who asks why did i help?)Future goals, etc...Both these rounds were conducted by Singapore panel. In second round, the questions were getting repeated, which i pointed out to my interviewer. She gave me a poker face and said ki she still wants to know the answer.
Feedback: Duhhh, 1 positive and 1 negative. They said, i gave professional experience based examples and they want to know my person life. Recruiter pushed me to give 3rd core value round, since I had got positive feedback for all tech rounds.
7. Core Values (3rd)This was taken by an experienced Indian guy. He talked about my previous Core value rounds. It was very chill. Felt like talking to a friend.
Final feedback: Positive.Super slow process.
Compensation: https://leetcode.com/discuss/compensation/2826804/Airbnb-or-SDE-2-or-India-or-Offer

12. [https://leetcode.com/discuss/post/2695021/airbnb-phone-coding-round-2-by-anonymous-un59/](https://leetcode.com/discuss/post/2695021/airbnb-phone-coding-round-2-by-anonymous-un59/) 
    11. A patron at a restaurant tells the waiter that out of the given menu, they’d like to order exactly 15.05worthofappetizers.Heoffersthewaitercomputerscienceliteraturetohelpsolvetheproblem.//Youarethewaiterinthisstory.Givenatotalsumforappetizers(intheexample15.05), write a program which writes to the screen what the customer’s order could be.
// Menu:// (“Fruit”, 2.15);// (“Fries”, 2.75);// (“Salad”, 3.35);// (“Wings”, 3.55);// (“Mozzarella”, 4.20);// (“Plate”, 5.80);
// Examples// possibleOrders(4.30) -> [[“Fruit”, “Fruit”]]// possibleOrders(4.90) -> [[“Fruit”, “Fries”]]// possibleOrders(5.50) -> [[“Fries”, “Fries”], [“Fruit”, “Salad”]]
// possibleOrders(15.05) -> [[“Fruit”, “Wings”, “Wings”, “Plate”], [“Fruit”, “Fruit”, “Fruit”, “Fruit”, “Fruit”, “Fruit”, “Fruit”]]// 2.15+3.55+3.55+5.80 = 15.05// if not possible return empty list// Unique possible combination solution

13. [https://leetcode.com/discuss/post/3397766/airbnb-oa-question-by-anonymous_user-euke/](https://leetcode.com/discuss/post/3397766/airbnb-oa-question-by-anonymous_user-euke/)
    12. There are 'n' stones in a row from 0 to n-1. For every ith stone , there are 2 values associated with it, a[i] and b[i] . You have to remove all the stones from the row one by one. Removing the ith stone follows the rule :
If (i-1)th and (i+1)th stones are still present , then , cost of removing the ith stone is b[i].
if either (i-1)th or (i+1)th stone is present , then cost of removing the ith stone is a[i].
if neither (i-1)th nor (i+1)th stone is present , the cost of removing the ith stone is 0.
Find the minimum total cost of removing all the stones.
Constraints :1 <= n <= 500001 <= a[i] , b[i] <= 1000

14. [https://leetcode.com/discuss/post/2652138/airbnb-system-design-l4-sde-2-by-anonymo-w1e2](https://leetcode.com/discuss/post/2652138/airbnb-system-design-l4-sde-2-by-anonymo-w1e2/)/
Design Group chat application.
Provide needed apis
DB schema
Draw hld diagram of services involved.
    13. [https://leetcode.com/discuss/post/2615653/airbnb-intern-india-august-2022-offer-by-9ss2/](https://leetcode.com/discuss/post/2615653/airbnb-intern-india-august-2022-offer-by-9ss2/)
**Education:** Bachelor's from Tier-2 college
**Position:** Software Intern at Airbnb (6 months)
**Locations:** India
**Date:** August, 2022
*On-campus opportunity*
**OA:**
2 medium-hard questions
    - Binary search based question, was able to solve completely
    - String based question where number of palindromic substrings needed to be found, with some conditions applied. Was able to solve partially
Onsite (3 rounds)
**Coding Round:**
    - 1 leetcode hard question, [Russian Doll Envelopes](https://leetcode.com/problems/russian-doll-envelopes/)
    - I gave the approach for the DP solution of O(N^2) time complexity, which the interviewer then asked me to code. He gave me 2 test cases to pass, which required some modification in the code for the larger test case and that took some time.
    - Emphasis was on working code and passing the test cases.
    - He then asked me to optimise it to O(NlogN) complexity, but due to shortage of time, I was not able to write code for that.
**Problem Solving round** (kind of Low Level Design):
    - **Design a call history manager;** where calls appear in chronological order, there is only 1 latest entry for each person who called, and we need to store name and phone number of people who called.
    - It was an application of LRU cache, where we needed to design the data structures and the *get* and *put* functions.
    - I tried out different approaches before coming to the LRU cache approach, with hints from the interviewer as well.
    - Emphasis was on thinking capability, discussion of time and space complexity of every approach. Only pseudocode was needed.
**Managerial Round:**
    - Questions on Projects and general discussion on how to add different features to the project
    - DBMS + HR questions
**Verdict: Selected!**
**Thoughts:**
The interviewers were super helpful and the process was quite smooth. The HR questions were quite interesting as well. Overall it was a great experience.

15. [https://leetcode.com/discuss/post/2415742/airbnb-thapar-university-question-by-ano-ohvj/](https://leetcode.com/discuss/post/2415742/airbnb-thapar-university-question-by-ano-ohvj/)
    14. Assigned parking in the same x coordinate

16. [https://leetcode.com/discuss/post/2345847/airbnb-sde-intern-india-july-2022-offer-m66gy/](https://leetcode.com/discuss/post/2345847/airbnb-sde-intern-india-july-2022-offer-m66gy/)
**Status:** New grad, B. Tech
**Position:** SDE-Intern at Airbnb
**Location:** India
**Date:** July, 2022
**Online Assessment (1 hour)**:
    - 2 Medium Questions
        1. Sliding Window with Variable Size
        2. 2-D Matrix, Prefix Sum, Binary Search
    - Solved 1 completely and 2 partially
    ## **Onsite (3 rounds)**
**Coding Round (45 mins):**
    - 2 Medium Questions
        1. Priority Queue, Binary Search on Answer
        2. Simulation, Greedy, BFS
    - Could answer both, asked for a hint in the second one.
    - Emphasis was on working code.
**Technical Round (45 mins):**
    - [1 Hard Question](https://leetcode.com/problems/all-oone-data-structure/)
    - Struggled to come up with an O(1) soln, optimised upto O(log(n)), got a hint that helped me with the thought process to optimise all operations to O(1).
    - Emphasis on underlying DSA and solution logic rather than working code, pseudocode was preferred.
**Technical Experience Round (45 mins):**
    - Projects + CS Core + HR questions
**Result**: Selected, offered a winter internship
**Overall review**
    - Focus on the fundamentals of DSA and a strong understanding of the internal workings of the same.
    - Keep interacting throughout the interview. Think out loud and explain everything.
    - Interviewers were very supportive and helpful in every round.
    - Prepare for classic HR questions, can help prepare for most situational questions you may expect.
    - Ask relevant questions to interviewers at the end of every interview.

17. [https://leetcode.com/discuss/post/2160577/airbnb-onsite-rooms-and-keys-ii-by-anony-397x/](https://leetcode.com/discuss/post/2160577/airbnb-onsite-rooms-and-keys-ii-by-anony-397x/)
We are given a 2D maze that's composed of rooms. We can move from one room to another neighbouring room in all four directions (L,U,R,D). The starting position in the maze is marked using ^ in the maze. Some rooms are blocked which means we cannot navigate to those rooms, these are marked with '#'. There are some rooms which are easy to go, these are marked using an empty space. Some rooms have a door to go inside the room and each of these rooms are marked with a capital alphabet, we can only go through these rooms if we have the corresponding key to this room.Some rooms have keys laying around (for other rooms), which you can collect upon entering that room and use later on to unlock those doors, the room with keys are marked with lower case alphabets. (A room with a door 'A' can be unlocked using key 'a' and so on.)
The question is, return the minimum number of steps taken to collect all keys inside the maze.
(P.S we can re-enter a room as many times, until we have unlocked all the doors or found all the keys).
Eg:
[['^',' ',' ','#'],[' ','#',' ','#'],['b','a',' ','C'],[' ','A','B','c']]
O/P: 10
I used a bfs approach to solve this question but the interviewer was not satisfied and the question itseld had a lot of edge cases which is difficult to figure out in a 35-40 mins interview.
[https://leetcode.com/problems/shortest-path-to-get-all-keys/](https://leetcode.com/problems/shortest-path-to-get-all-keys/)

18. [https://leetcode.com/discuss/post/2133358/airbnb-sse-rejected-by-thisisrahul891-rzd2/](https://leetcode.com/discuss/post/2133358/airbnb-sse-rejected-by-thisisrahul891-rzd2/)
had applied on the Airbnb career portal, was contacted by an Airbnb recruiter after a couple weeks. They screen candidates through an online assessment.
Online Assesment: It was Hackerrank test, had just 1 question. It was a graph based problem. I don't remember exactly what it was. My solution gave TLE for 1 test-case and passed the remaining test-cases.
I was invitied for further rounds. There were 2 coding rounds (45 mins each) and 1 design round (about 60 mins).
Round1 (45-min): Find minimum window in a string containing all characters from a given pattern: [https://leetcode.com/problems/minimum-window-substring/](https://leetcode.com/problems/minimum-window-substring/)
I suggested a brute force approach first, with some hints I was able to come up with an optimal solution but my code had some bugs.
Round2 (45 mins): Sliding puzzle similar to this: [https://leetcode.com/problems/sliding-puzzle/](https://leetcode.com/problems/sliding-puzzle/)
I started with a DFS based approach which is sub-optimal for this question. Then moved to BFS based approach which was a better solution. The interviewer pointed out a couple of errors in my code.
Round 3 (System design, 1 hr): You are getting current weather data at periodic intervals from multiple sub-stations within a country. Each sub-station will give you the weather data for its region, they had given the format of data that the sub-stations send. Build a system to fetch historical data and also given predictions about the future weather for a given region. They wanted the high-level design. Sorry if the question seems vague, I might have forgotten some details.
Verdict: Rejected due to coding round. They expect an optimal solution with not too much hints.

19. [https://leetcode.com/discuss/post/2002775/airbnb-phonescreen-by-snoopdog25-v00j/](https://leetcode.com/discuss/post/2002775/airbnb-phonescreen-by-snoopdog25-v00j/)
Write a program to Print HasNext(), Next() and Remove() an element from list of list.
```c#
[ [ ],[ 1, 2, 3], [ 4, 5], [ 6, 7 ], [ 8 ] ]

HasNext() - True
Next() - 1
Remove() - 1

```
Solved it using two queues. Rejected.

20. [https://leetcode.com/discuss/post/1961712/airbnb-sde2-bangalore-april-2022-reject-799i3/](https://leetcode.com/discuss/post/1961712/airbnb-sde2-bangalore-april-2022-reject-799i3/)
Round 1: Online assessment on hackerrank
Questions were leetcode medium
Total questions: 3
Round 2: DSA round
Interviewer asked a modified version of
[https://leetcode.com/problems/cheapest-flights-within-k-stops/](https://leetcode.com/problems/cheapest-flights-within-k-stops/)
where i needed to print cheapest path taken within k stops
Round 3: LLD round
Design Shut the box game
[https://en.wikipedia.org/wiki/Shut_the_box#/media/File:Shut_the_box.jpg](https://en.wikipedia.org/wiki/Shut_the_box#/media/File:Shut_the_box.jpg)
No optimisation, just play game and get percentage of chances a user can win in the game
Not sure why I got a reject but felt most of the rounds went well .
Had solved in both rounds correctly

21. [https://leetcode.com/discuss/post/1837611/airbnb-l4-interview-bangalore-by-anonymo-qkqg/](https://leetcode.com/discuss/post/1837611/airbnb-l4-interview-bangalore-by-anonymo-qkqg/)
**Online Assessment**
    15. Question related to binary search.
Coding Round -1
You're given a 3x3 board of a tile puzzle, with 8 tiles numbered 1 to 8, and an empty spot. You can move any tile adjacent to the empty spot, to the empty spot, creating an empty spot where the tile originally was. The goal is to find a minimum number of moves that will solve the board, i.e. get [ [1, 2, 3], [4, 5, 6], [7, 8, - ]…
Coding Round -2
Input is a array represent how the height of water is at each position, the number of water will be poured, and the pour position. Print the land after all water are poured.
Example: input land height int[]{5,4,2,1,3,2,2,1,0,1,4,3} The land is looks like:
```python
+
++        +
++  +     ++
+++ +++   ++
++++++++ +++
++++++++++++
012345678901
water quantity is 8 and pour at position 5. The land becomes:

+
++        +
++www+    ++
+++w+++www++
++++++++w+++
++++++++++++
012345678901

```
**Architectural Interview**
**Experience Interview**
Discussion regarding my current organisation project, from business requirement to development, challenges, timelines estimation, impact, my contribution, etc. Basically, they are checking if I know end to end and each and every minor info about the project. Also, few questions regarding the scalability and the scope of any improvement in the current design.

22. [https://leetcode.com/discuss/post/1776937/airbnb-phone-interview-palindrome-pairs-q6pck/](https://leetcode.com/discuss/post/1776937/airbnb-phone-interview-palindrome-pairs-q6pck/)
    16. [https://leetcode.com/problems/palindrome-pairs/](https://leetcode.com/problems/palindrome-pairs/)

23. [https://leetcode.com/discuss/post/1743143/airbnb-onsite-check-if-thief-can-get-fro-sfie/](https://leetcode.com/discuss/post/1743143/airbnb-onsite-check-if-thief-can-get-fro-sfie/)
    - [ ] For the thief to cross, there should be no group of sensors blocking from left wall to right wall. 1. Create an edge between all overlapping sensor circles 2. Check if a path exists from left wall to right wall via any sensors. 3. If yes, return false, if not, return true.
