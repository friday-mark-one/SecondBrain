---

---

```c++
#include <cmath>
#include <cstdio>
#include <vector>
#include <iostream>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <climits>
using namespace std;

/*

questions:

benefit of creating a mask? is it for space complexity?

*/

int combineOrder(unordered_map<int,int> menuItems, int orderMask) {
    if (orderMask == 0) {
        return 0;
    }
    int minCost = INT_MAX;
    for (auto it : menuItems) {
        int menuItem = it.first;
        int price = it.second;
        if (menuItem & orderMask) {
            int remainingOrder = orderMask & (~menuItem);
            int cost = price + combineOrder(menuItems, remainingOrder);
            minCost = min(minCost, cost);
        }
    }
    return minCost;
}


int bestPrice(vector<int>& price, vector<vector<string>>& menu, vector<string>& order) {
    unordered_set<string> dishes;
    for (int i = 0; i < menu.size(); i++) {
        for (int j = 0; j < menu[i].size(); j++) {
            dishes.insert(menu[i][j]);
        }
    } 
    
    unordered_map<string, int> itemMask;
    
    int itemCounter = 0;
    for (int i = 0; i < menu.size(); i++) {
        for (int j = 0; j < menu[i].size(); j++) {
            if (itemMask.find(menu[i][j]) == itemMask.end()) {
                itemMask[menu[i][j]] = 1 << itemCounter;
                itemCounter++;
            }
        }
    }
    
    unordered_map<int,int> menuItems;
    for (int i = 0; i < menu.size(); i++) {
        int menuMask = 0;
        for (int j = 0; j < menu[i].size(); j++) {
            menuMask |= itemMask[menu[i][j]];
        }
        menuItems[menuMask] = price[i];
    }
    
    int orderMask = 0;
    for (int i = 0; i < order.size(); i++) {
        if (dishes.find(order[i]) == dishes.end()) {
            return -1;
        }
        orderMask |= itemMask[order[i]];
    }
       
    return combineOrder(menuItems, orderMask);
}


int main() {
       
    vector<int> prices = {5, 8, 4};
    vector<vector<string>> menuItems = {
        {"pizza"},
        {"sandwich", "coke"},
        {"pasta"}
    };
    
    vector<string> order = {"sandwich", "pasta", "coke", "pizza", "abcd"};
    
    cout << bestPrice(prices, menuItems, order) << endl;
    
    return 0;
    /*
    pizza = 1
    sandwich = 10
    coke = 100
    pasta = 1000
    
    1010
    
    1 - 5.0
    110 - 8.0
    1000 - 4.0
    
    */
//     [5.00, "pizza"],
//     [8.00, "sandwich,coke"],
//     [4.00, "pasta"]

// user_wants: ["sandwich", "pasta"]
}
// Your old code in python3 has been preserved below.
// /*
// You are building an App that lets the users determine the most cost-effective order that they can place in a restaurant for the food items that they want to have. You have the menu of the restaurant that contains item name, and it's price. The restaurant can also offer Value Meals, which are groups of several items, at a discounted price. Write a program that accepts a list of menu items, and a list of items that the user wants to eat, and outputs the best price at which they can get all of their desired items.

// [Constraint: The user can want a maximum of 3 unique items.]

// Note (let the candidate ask for these clarifications): It is ok to order extra items that the user does not want but might come in the meal. It's possible that the restaurant does not have all the items that users the wants to eat. In this case, best price should be returned as -1.

// Menu Item format:
// For a Single Item:

// [price, "item label"]
// For a Value Meal:

// [price, "item 1 label,item 2 label"]

// EXAMPLE 1 (only one combination exists for the user wanted items)

// INPUT

// Restaurant Menu:
// [
//     [5.00, "pizza"],
//     [8.00, "sandwich,coke"],
//     [4.00, "pasta"]
// ]

// user_wants: ["sandwich", "pasta"]

// OUTPUT
// 12.0

// # which would be 
// # - [8.00, "sandwich,coke"],
// # - [4.00, "pasta"]

// -----------------------------------------------------------------------------------

// EXAMPLE 2 (more than one combination exists. return the one with the best price)

// INPUT

// Restaurant Menu:
// [
//     [5.00, "pizza"],
//     [8.00, "sandwich,coke"],
//     [4.00, "pasta"],
//     [3.00, "coke"],
//     [6.00, "pasta,coke,pizza"],
//     [8.00, "burger,coke,pizza"],
//     [6.00, "sandwich"]
// ]

// user_wants: ["pizza", "sandwich", "coke"]

// OUTPUT
// 12.0

// # which would be 
// # - [6.00, "pasta,coke,pizza"],
// # - [6.00, "sandwich"]

// -----------------------------------------------------------------------------------

// EXAMPLE 3 (no combination exists)

// INPUT

// Restaurant Menu:
// [
//     [5.00, "pizza"],
//     [4.00, "pasta"],
//     [3.00, "coke"],
//     [6.00, "pasta,coke,pizza"],
//     [8.00, "burger,coke,pizza"]
// ]

// user_wants: ["pizza", "sandwich", "coke"]

// OUTPUT
// -1

// */

```
