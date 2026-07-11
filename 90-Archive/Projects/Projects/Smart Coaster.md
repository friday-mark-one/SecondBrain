---

---

Load Cell + HX711 - [https://www.amazon.com/Bridge-Digital-Amplifier-Arduino-DIYmalls/dp/B086ZHXNJH](https://www.amazon.com/Bridge-Digital-Amplifier-Arduino-DIYmalls/dp/B086ZHXNJH)

CanaKit - [https://www.canakit.com/raspberry-pi-3-starter-kit.html](https://www.canakit.com/raspberry-pi-3-starter-kit.html)

Wire connection tutorial - [https://circuitjournal.com/50kg-load-cells-with-HX711](https://circuitjournal.com/50kg-load-cells-with-HX711)

Calibration guide - [https://tutorials-raspberrypi.com/digital-raspberry-pi-scale-weight-sensor-hx711/](https://tutorials-raspberrypi.com/digital-raspberry-pi-scale-weight-sensor-hx711/)

HX711 lib - [https://github.com/tatobari/hx711py](https://github.com/tatobari/hx711py)

Other projects: [https://www.testdevlab.com/blog/2020/02/21/how-we-built-smart-scales-for-our-office-coffee-drawer/](https://www.testdevlab.com/blog/2020/02/21/how-we-built-smart-scales-for-our-office-coffee-drawer/)

Closest tutorial:

[https://circuitjournal.com/50kg-load-cells-with-HX711](https://circuitjournal.com/50kg-load-cells-with-HX711)

Python code modifications

- MSB~~ or LSB~~
- Line 79: HX711(23, 24) or the other way around - Correct



### Tasks

- [ ] Full bottle weight
- [ ] Empty bottle weight
- [ ] Remind to drink water every x minutes if delta change in bottle weight is less than y 
- [ ] Sample weight of bottle every z minutes
- [ ] Various intensity of notification to differentiate the number of times the drink cycle was skipped
- [ ] Suppress notification when drink is done after a few minutes
- [ ] Adapt timer if bottle weight changed between drink cycles
- [ ] Metrics to know how much I drink every day, at what time and some trends
- [ ] Daily statistics to be delivered to phone as a notification by end of day
- [ ] Drink water 30 min after a meal. Not sure how to do that
- [ ] What to do when there is no bottle on the coaster for a long time?
- [ ] What to do when not at the workstation?
- [x] Weight to liters conversion
- [ ] Temporary external weight avoidance


### Algorithm

1. Give option to place empty bottle first or enter the capacity of bottle to know how much liters will be in the bottle. (start with hardcoded predetermined empty bottle weight).
2. Check the weight every 3 seconds. 
3. If the weight has not reduced 10g in the next 20 min, send a notification.
4. If the weight suddenly became 0, wait 10 seconds. I may be drinking at that time.
5. Keep checking the weight every 3 seconds for the next 1 minute to see if weight increases (bottle is placed back on the coaster)
6. If not check every 1 minute (I maybe asleep or headed out to work)
7. If the weight increased, make sure the weight is lesser than the previous non-empty weight.
    1. The difference is the amount of water I drank, noted with timestamp somewhere.
8. If weight is greater than previous non-empty weight, then the bottle was emptied and refilled or directly refilled without emptying. There’s no way to know.
    2. Assume the bottle was emptied and refilled.
9. Go back to checking every 3 seconds and start reminder cycle 20 min from now.
10. 