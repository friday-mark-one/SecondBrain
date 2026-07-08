---
notion-id: 28e02d25-148c-8048-bc19-d66ba140e535
---
```javascript
#include <cmath>
#include <cstdio>
#include <vector>
#include <iostream>
#include <algorithm>
using namespace std;

/*
Imagine you're tasked with optimizing Airbnb's booking system to better accommodate group bookings. 

For example, a group of 10 people is planning to travel to SoHo NYC, and there are no single properties that can accommodate 10 guests. The system should recommend multiple properties within the same neighborhood so the group can stay close together. The goal is to suggest the optimal combination of neighboring properties for groups wanting to stay close to each other, aiming to minimize the total number of properties used.

You are given a list of properties, each described by an object that includes the following attributes: ID (a unique numeric identifier), neighborhood (a string), and capacity (an integer representing how many guests can be accommodated).

Write an algorithm that suggests properties for a specific group size in a specific neighborhood. The solution should prioritize minimizing the number of properties and capacity used while ensuring all group members are accommodated. Properties are considered 'neighboring' if they are in the same neighborhood.

# Schema
Property(id, neighborhood, capacity)

# Example 1 (Single property can accomodate everyone)
## Input
Properties = [
    Property(1, "downtown", 5),
    Property(2, "downtown", 3),
    Property(3, "downtown", 1),
    Property(4, "uptown", 4),
    Property(5, "uptown", 2)
]
Neighborhood = "downtown"
GroupSize: 4

## Output
RecommendedProperties = [1]

# Example 2 (Multiple properties needed)
## Input
Properties = [
    Property(1, "downtown", 5),
    Property(2, "downtown", 3),
    Property(3, "downtown", 1),
    Property(4, "uptown", 4),
    Property(5, "uptown", 2)
]
Neighborhood = "downtown"
GroupSize: 6

## Output
RecommendedProperties = [1, 3]

# Example 3 (No available combination)
## Input
Properties = [
    Property(1, "downtown", 5),
    Property(2, "downtown", 3),
    Property(3, "downtown", 1),
    Property(4, "uptown", 4),
    Property(5, "uptown", 2)
]
Neighborhood = "uptown"
GroupSize: 10

## Output
RecommendedProperties = []

# Example 4 (Multiple combinations can accomodate all the guests, but one is the most optimal on minimizing capacity)
### Input
new Property(1, "downtown", 4),
new Property(2, "downtown", 3),
new Property(3, "downtown", 2),
new Property(4, "uptown", 4),
new Property(5, "uptown", 2)

Neighborhood = "downtown"
GroupSize: 5
 
## Output
RecommendedProperties = [2, 3] 

*/

struct Property {
    int id;
    string neighborhood;
    int capacity;
    
    Property(int id, string neighborhood, int capacity) 
    : id(id)
    , neighborhood(neighborhood)
    , capacity(capacity) 
    {}
};

pair<int,vector<int>> findOptimal(vector<Property*>& properties, int groupSize, int n) {
    if (groupSize <= 0) {
        return {0, {}};
    }
    
    if (n == 0) {
        return {100000, {}};
    }
    
    auto picking = findOptimal(properties, groupSize - properties[n-1]->capacity, n-1);
    picking.second.push_back(properties[n-1]->id);
    
    auto notPicking = findOptimal(properties, groupSize, n-1);
    
    if (picking.first != 100000 && notPicking.first != 100000) {
        if (picking.second.size() < notPicking.second.size()) {
            return picking;
        }
    }
    return {100000, {}};
}


pair<int,vector<int>> findOptimalProperties(vector<Property*>& properties, int groupSize, string targetNeighborhood) {
    vector<Property*> targetProperties;
    for (auto p : properties) {
        if (p->neighborhood == targetNeighborhood) {
            targetProperties.push_back(p);
        }
    }
    return findOptimal(targetProperties, groupSize, targetProperties.size());
}




int main() {
    
    Property* p1 = new Property(1, "downtown", 5);
    Property* p2 = new Property(2, "downtown", 3);
    Property* p3 = new Property(3, "downtown", 2);
    Property* p4 = new Property(4, "uptown", 4);
    Property* p5 = new Property(5, "uptown", 2);
    
    string targetNeighborhood = "downtown";
    int groupSize = 5;
    
    vector<Property*> properties = {p1, p2, p3, p4, p5};
    auto optimalProperties = findOptimalProperties(properties, groupSize, targetNeighborhood);
    for (auto p : optimalProperties.second) {
        cout << p << endl;
    }

    return 0;
}
```
