---

---
Share mouse and keyboard across different physical machines. These machines can belong to any operating system.

## Rough design

---

1. A server is spawn at the master. Master is the machine to which a mouse or a keyboard is physically connected.
2. Slaves connect to the server in the master using a client.
3. A client should register itself with the server using initial authentication procedure.
    1. The client sends a request to the server to identify itself with a unique identity, its relative position to the master and other required details.
    2. The master stores these details so that data can be streamed to the client when needed.
4. Though this is a client-server architecture, the overall flow should be peer-to-peer. This is required when we want to share clipboard content, files or any data across these machines. Hence, a 2-way communication is required.

## Things to keep in mind

---

- At any point in time, the master should know the focus environment.
    - If the focus is at current environment, there is nothing to be done.
    - If the focus moves to another environment, all inputs to the master should be redirected to the respective client.
- In order to redirect actions to client, the server should intercept mouse and keyboard events from the master.
- Mouse events or keyboard events can be communicated through UDP
- But clipboard copy and file copy must happen over TCP.
- After a bit of researching, looks like UDP can sometimes be slower than TCP because UDP tries to connect every time in a loop whereas TCP connects just once. So use connect for UDP and benchmark with TCP before proceeding further.
- Every node in the system should know about the arrangement relative to each other, so that any node can become master at any time in the case where there are multiple input devices connected to different nodes.
- Using Protocol Buffers for sharing structured data across machine
[https://developers.google.com/protocol-buffers](https://developers.google.com/protocol-buffers)
- What happens when an extended monitor is physically connected to master? How to handle that case?

## Feasible?

---

- Extend this functionality to smart phones
- Integrate with BetterTouchTool

## Corner cases

---

- If the focus stays in one of the clients for a long duration, then the master should not be put to sleep because of inactivity. This may cause the flow to be interrupted. So periodically make sure all machines stay awake.

## Next steps

---

Create a client-server communication

Create a simple single client-server communication. Check which is actually faster. TCP or UDP.

Handle the design for multiple clients joining at any time

Stream all mouse events as coordinates

Simulate the mouse event on the client machine

Intercept all mouse events in the master

Stream mouse events based on focus environment (relative to master)

Perform all the above for keyboard events

Create a shared clipboard

Implement drag-and-drop

Fit & finish

## Rough area

---

Added SPSC circular queue data structure

Single producer, Single consumer Circular Queue - [https://bitbucket.org/sevangelatos/lockless_spsc_queue/src/master/](https://bitbucket.org/sevangelatos/lockless_spsc_queue/src/master/)

Explanation for various memory models - [https://www.codeproject.com/articles/43510/lock-free-single-producer-single-consumer-circular#heading_references](https://www.codeproject.com/articles/43510/lock-free-single-producer-single-consumer-circular#heading_references)

Changed C++ language standard to C++17 to accommodate atomic

Initiate a separate thread for listening to events  in the circular queue with size 4096

Faced errors with importing C++ libraries like vector, atomic like "vector file not found"

https://stackoverflow.com/a/53948796/3505471 - this answer provides why this is because of the bridge between Swift - Objective-C - C++

To solve that, moved certain includes to class declarations. Modified SocketConnection class to singleton instance so that the Wrapper class header need not be aware of the SocketConnection class while maintaining a global presence in the WrapperClass implementation.

Measured the time difference between producer and consumer of the events and found differences in the order of 0 - 13 ms.

I believe consumer thread is not closed properly. The destructor waits for the thread to join, but running in an infinite loop, the consumer never seems to quit. Need to handle that with an interruption point and notify to terminate somehow.

It is really confusing to have declaration and definition in .h and .cpp files respectively. According to some suggestion, placed both declaration and definition in the same header file for now.