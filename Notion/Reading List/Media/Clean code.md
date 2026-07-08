---
notion-id: 6c111d41-683d-42d7-a2a3-474ae20e03f3
base: "[[Media.base]]"
Type: Book
Summary: ""
ASIN: ""
Author: []
---
# Clean Code

Robert “Uncle Bob” Martin

Ep2 Names

- Names are the message of communication.
- Reveal your intent with the name. Shouldn't be necessary to include comments.
- Should not force us to see the usage to understand what it does.
- Disinformation is giving wrong name to something which does something different
- Avoid prefixes on names.
- The longer the scope of a variable, the longer should be its name.
- The longer the scope of a function, the smaller should be its name.

Ep3 Functions

- Functions should be on average 5 lines
- Extract functions into private classes with common variables as members
- Extract out predicates in if statements
- A function should do one thing and one thing only
    - Extract till you drop. Go till the atoms.

Ep4 Functions structure

- Functions should take Max 3 arguments
- No Boolean in a function parameter
    - Create 2 functions for true and false respectively.
- No output arguments - because it is confusing
- Don't send null in arguments - create 2 functions
- The step down rule - public and important methods at the top and more detailed private methods towards the bottom
- Switch statements can be replaced with polymorphism. Eg. If A->B, this can be replaced as A provides an interface I which is derived by B.
- Same goes for chain of if..else statements
- Switch statements hinders independent programming, development and deployment
- Temporal coupling
    - The scenario in which a set of functions should be executed in a particular order.
    - Like open a file, run some commands, close the file.
    - We can work around this problem by passing a block to a function.
- Command query separation
    - Function that change state should not return value - COMMAND
        - Eg. Setters
        - It can throw exceptions for informing error codes
    - Function that does not change state can return values -
    - QUERY
        - Eg. Getters
    - Tell; don't ask - We should tell objects what to do and not ask their state and take decisions on their behalf. This reduces the number of Queries.
- Law of Demeter
    - Too much knowledge in a single line of code. It's dangerous.
- Error handling should be done through exceptions. Scope the exception class to that class for understandability.
- Try should be the first statement after variable declaration in a function
- Finally should be the last statement in the function.
- The body of a try block should have one line that calls a function that throws exception

Ep5 Forms

- The code should provide you an idea of the coding standard and not any documentation.
- Don't let readers use the horizontal scroll bar.
- Make functions of a class should be more cohesive. i.e. a function should impact most of the member variables.
- Getters and setters are opposite of cohesive.
- Data structures have public variables and almost no functions whereas a class has public functions and private variables
- Adding a new function to a data structure does not affect independent deployability nor does it affect the existing code. Whereas adding a new function to a base class affects it's derived class and client code.
- We use classes and objects when it's types that are more likely to be added
- We use data structures when it is the methods that are more likely to be added.
- Source code dependency should point from concrete to abstract.
- Views should know about the application and not vice versa.

Ep6 TDD

- Major advantage is that with very good test coverage, cleaning the code becomes fearless.
- 3 laws of TDD
    - Write **no** production code except to pass a failing test
    - Write only **enough** of a test to demonstrate a failure
    - Write only **enough** production code to pass the test.
- Advantages of TDD
    - Confidence in changing existing code
    - Reduce debugging time
    - Decoupling
    - No separate documentation needed. Test suites says it all.

Ep7 Architecture, Use cases and high level design

- A good architecture maximizes the options and helps postpone decisions not made. Like which technology to use.
- Use cases should be decoupled from what is delivered
- Entities, interactors and boundaries

Ep8 SOLID principles

- Design smells
    - **Rigidity** - a system that is hard to change and a long time to change.
    - **Fragility** - when a small change in one module causes impact to an unrelated module.
    - **Immobility** - a code that is not easily portable to another system due to strong coupling.
    - **Viscosity** - building and testing takes a long time.
    - **Needless complexity** - think of unnecessary long term design additions
- Dependency inversion

![](https://lh7-us.googleusercontent.com/hKGBIRq5ecOWDZX3gwh3X9PRFKtGRxzRjmPy8OywbbJiLmRj7RRIvJRU8lE97XLtcwC64JtwyAvZApY5uDuziUuDAHlJBddY_ydtHyFcrgI7RrSSF06rd_Jjfi937b8EuDprPxbQZxMg6ultvKv9Vg)

- OO is at the end of the day, dependency management.

Ep9 Single responsibility principle

- Self explanatory
- Responsibility should be split based on the actor
- Secondary value of the software is behavior that meets the customer needs
- Primary value of the software is the flexibility that allows to meet the customer needs throughout the life time.

Ep10 Open Closed Principle

- Open for extension but closed for modification.
- It is impractical to get everything right the first time. There's no crystal ball.
- Iteratively improve the design conforming to open closed principle.

Ep11 The Liskov Substitution Principle

- A square IS A rectangle in real world, but a square class (representation of a square) is not a subtype of rectangle class (representation of rectangle)
- Ensure these principles using heuristics
    - If the base class does something, the derived class must do it too. i.e. the subtype must do more, it can never do less.
    - If there is a degenerate function in the derived class (a function that does nothing), then there is possibly a Liskov Substitution Principle violation.
    - Dreaded if instanceof object
        - You are allowed to check instanceof if you already know what type it is.
    - Typecases usually denote violation
        - Example, if instanceof else if instanceof ……
    - Statics vs Dynamics
        - Static languages are type safe. They check the instances for type errors during compilation
        - Eh. C++, Java
        - Dynamic languages determine this only at runtime.
        - We are trending towards dynamic languages because TDD takes care of type safety instead of being enforced by the compiler.

Ep12 The Interface segregation principle

- An interface has more to do with the user of the interface than with the inherited implementations of the interface
- This principle addresses the problem of fat classes. A class that does a lot of different things required by a lot of different modules. Eg. Job class in a Photocopier system
- Simply said, don't depend on methods that you don't use.

Ep13 Dependency inversion

- High level policies should not depend on low level details

Ep14 SOLID summary

- You don’t have to strictly follow every principle
- Use the knowledge to your advantage and engineer an appropriate solution

Ep15 SOLID components

- Components are independently deployable modules. They need not be built when there are changes to the application consuming it.
- Independence of deployment and Independence of development are the advantages of a component.

Ep16 Component Cohesion

- False cohesion
    - Derivatives inheriting an interface should be in a different component.
    - Even if it feels like 2 classes should be going together, make sure if they should be coupled together closely.
- Release reuse equivalence principle
    - The granule of reuse is the granule of release
- The common closure principle
    - Classes that change for the same reason should be grouped together into components
    - A class should change only for one reason. If not, then it violates the single responsibility principle
- The common reuse principle
    - When you construct a component, make sure that all the classes are used from that component
    - Similar to Interface segregation principle.
- The above 3 principles are mutually exclusive and needs to be chosen based on the maturity of the principle.
- Component partitioning depends on project maturity. A new project tends to have a component structure which changes with maturity.

Ep17 Component coupling

- Creating cyclic dependencies between components cause morning-after syndrome.
- **Acyclic dependencies principle - the dependency structure of the architecture must have a Directed Acyclic Graph (DAG)**
    - i.e. Multiple components need to be upgraded at the same time to even build
    - This can be solved by removing the cycle and creating a new component or inverting the dependency using an interface.
- **Stable dependency principle**
    - Something that is hard to change is stable
    - Something that is easy to change is unstable
    - The principle states that a component should depend on others only if they are stable. (make sure the component you are dependent on is so stable that it hurts anyone else who tries to change it)
    - Or it can be stated as - All the components in an architecture should be pointing in the direction of increasing stability.
- Measure stability
    - Instability (I) = Fan out / (Fan in + Fan out)
        - If I is 0, it is stable
        - If I is 1, it is unstable
- So all arrows should point in the direction of decreasing I.
- This makes the more stable components difficult to change. So to make modifications to those components, we can use open closed principle. We cannot make modifications directly instead, we can extend those classes and make modifications.
- This brings to the **Stable Abstraction Principle**
    - The more stable a component is, the more abstract it should be.

Ep18 Component case study

Ep19 Advanced TDD

- As the test gets more specific, the code gets more generic.

Ep20 Clean tests

- Arrange, Act, Assert, Annihilate
- Make sure all of them are composed

Ep21 Test design

- Test should also conform to SOLID principles
- A little bit of upfront planning is a good thing instead of just writing failing tests and writing production code to pass those tests and looping over again.
- Use Given, When, Then approach to name tests

Ep22 Test process

- Fake it till you make it.
    - Write tests to make is just pass - by faking the solution.
    - With more tests, the amount of faking reduces and eventually you make it.
- Stair step test - write temp tests that creates step to write the next step and throw away the temp test.

Ep23 Mocking

- Test Double <- Dummy <- Stub <- Spy <- Mock
<- Fake
- Test patterns
    - Test specific subclass
    - Self shunt
    - Humble Objects

Ep24 Transformation Priority Premise

Ep25 Design Patterns

- Command pattern
    - Most often it is an Interface (abstract class in terms of C++) named Command with a single method named execute()
    - A command pattern is a way of decoupling what is done from who does it. I.e. decoupling actors from actions
    - The commands can be queued in a list, so that we can decouple what was done from when it was done.
    - **Actor Model**
        - When there are multiple thread (say 1000s) and it needs to be executed in a memory constrained environment (like a photocopier), it is not possible to allocate separate stack to each thread. There is a possibility of stack overflow.
        - So in an actor model, we use Command pattern and put all commands in a list.
            - If the user has pressed one of the five buttons, the corresponding light is switched ON, the command is removed from the list.
            - If no button was pressed, the command adds itself to the list before exiting to wait until the next time the button is pressed while looping through other commands in the list.
        - So this allows 100s or 1000s of asynchronous threads to share a common stack.

Ep26 Factories

- Abstract factory pattern
    - Use this in conformance with dependency inversion principle.
    - A factory impl derives from abstract factory and creates objects of the derived class.
    - The interface classes can be deployed independently from the implementation classes and hence separated by a clear boundary.
    - The problem with this pattern is that if more classes are derived from the interface, corresponding makeObject method needs to be created above the line in the abstract factory class, hence creating coupling and deterring independent deployability.
    - This can be prevented by calling a method below the line that gives the list of derived classes with which objects can be created instead of having makeObject method for each class.
    - But in doing so we compromise on the type safety of the object created with runtime errors. This type safety can be prevented by having a good suite of unit tests and also reaping the benefits of independent deployability.
- There are other variants like factory method.

Ep27 Strategy & Template method patterns

- **Strategy pattern** is a pattern that allows us to separate high level policies from a set of low level details.
- Example: An FTP class can call send packets function of an interface class PacketProtocol (where several protocols are derived), thus hiding FTP class (high level policy) from PacketProtocol (low level detail).
- Template pattern does the same thing but instead of an external interface, it is done within the same class using an abstract function and derived from the same class.
- Abstract Factory and Factory method are special cases of Strategy and Template Patterns respectively.

Ep28 Finite state machine and the State Pattern

- Use Given, When, Then to describe a state diagram.
- Eg. in a turnstile machine, **given** the machine is in locked state, **when** a coin is dropped, **then** transition to unlocked state and **execute** unlock() action.

Ep29 SMC Parser

- Bakus Naur Form (BNF) - a syntax to represent Finite State Machine
- They can be converted to data structures which are not affected by the spelling of the syntax. Spelling refers to : { } ( ) , etc.
- Used builder pattern in parser.

Ep30 SMC generator

- Visitor pattern to provide polymorphic functionality without disturbing the existing hierarchy.

Ep31 Observer pattern

- Clock - real time display example
    - Limitations of Java and C# in allowing multiple inheritance.
    - Models of observer pattern
        - Push model
        - Poll model
    - Simple way to get callbacks
- Model View Controller
    - A model can have any controllers and many views
- Model View Presenter

Ep32 Pile O’ Patterns

- Singleton pattern
    - Static and dynamic singleton
    - Used to enforce restriction on public API
    - Use double equal check twice with synchronized thread locks on volatile variable in java for APIs with cyclic dependencies that are slow.
- Monostate pattern
    - Hide the singleton state from the clients
    - Make all members static while all methods are non-static
    - Same problems as above apply here in case of cyclic dependencies and threads which can be solved using the same set of solutions.
- Null Object pattern
    - Returns a careful implementation of the corresponding class that does “nothing” so that it does not create any consequences when a null object is returned. Eg. A null object in Payroll system.
- Proxy pattern
    - Communication between two systems, without each other knowing they exist.
    - Eg. Print paycheck, a communication between Users and a (Printer in a network)
- Decorator
    - Add behaviours to existing class hierarchies without changing the hierarchy
    - Just like visitor pattern

Ep33 Pattern roundup

- Facade pattern
    - A way of imposing policy on a group of objects from above
- Mediator pattern
    - A way of imposing policy on a group of objects behind the scenes
- Flyweight object
    - Sharing a common state among a bunch of objects.
- Memento pattern
    - Way to encapsulate private state of an object, pass it around the system and unpack the state
    - Eg. Chess
- Extension object (member of visitor family)
    - A way to add new behaviour to existing hierarchy without changing the hierarchy

Ep34 Pattern Apocalypse

- Bridge pattern
- Chain of responsibility
- Interpreter
- Iterator
- Adapter