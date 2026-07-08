---
notion-id: 1fc02d25-148c-806b-be26-d3a59098dcd4
---
# Goal

A website that only robots can enter.

# Tangents

1. A game to play with AI agents. Every hurdle you tell the AI agent what to do to move to the next level
2. Add puzzles at the end to conclude that AI can’t replace humans
    1. Figure out a hurdle that only humans can solve
    2. Eg. Movie references that AI can’t catch or meme culture like Rick rolling
3. Make it hard, but doable by smart humans
4. Increasing difficulty in terms of how computers evolved and only those technologies can solve the problem
    3. Logical questions
    4. Math-heavy computations
    5. Image recognition
    6. Pattern recognition
    7. LLM and LAM
    8. AGI

# Rough idea

There can be multiple hurdles that a robot has to cross the reach the lounge. Should these hurdles just test raw computing power or should it incorporate puzzles?

5. First test is simple. Fail the recaptcha test (This means the robot can read the DOM)
    1. Any human-like mouse movement will be rejected
    2. So it has to be document.getElementById(’robotButton’).click() that allows the robot to move to the next page.
6. Compute the original string of a SHA-256 hash
7. Move the script to server-side so people can’t just inspect the js on the client-side
8. Add a DB to store all the robots that made it to the lounge
    3. “Jarvis was here”

# Rules

9. If you fail at any point, you start from the beginning
10. The path to the lounge won’t be the same. There will be some randomness.

# Random thoughts

### Random lines

No homos or No sapiens

Meme where two men laugh when one of the them says “Women!”. Same thing but replace with “Humans!”