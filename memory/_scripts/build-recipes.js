const fs = require("node:fs");
const path = require("node:path");

const BUNDLE = path.join(__dirname, "..");   // works from <vault>/memory/_scripts/
const RECIPES = path.join(BUNDLE, "Recipes");
const ITEMS = path.join(BUNDLE, "Items");

// Existing item names (exact filenames, minus .md)
const existing = new Set(fs.readdirSync(ITEMS).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, "")));

// Best-guess store for NEW items the recipes need. Anything referenced but not
// here and not existing goes to the "assign store" bucket of the draft.
const NEW_STORE = {
  "Coriander powder": "Indian Store", "Cumin powder": "Indian Store", "Cinnamon": "Indian Store",
  "Bay leaf": "Indian Store", "Cloves": "Indian Store", "Fennel seeds": "Indian Store",
  "Dry red chilli": "Indian Store", "Urad dal": "Indian Store", "Pav bhaji masala": "Indian Store",
  "Pepper jeera powder": "Indian Store", "Drumstick": "Indian Store",
  "Parmesan cheese": "Fred Meyer", "Soy sauce": "Fred Meyer", "Sesame oil": "Fred Meyer",
  "Black vinegar": "Fred Meyer", "Lo mein noodles": "Fred Meyer",
  "Pasta": "Costco", "Olive oil": "Costco",
};

const I = (item, amount) => ({ item, amount });

const recipes = [
  { name: "Pav Bhaji", meal: ["dinner"], cuisine: "North Indian", protein: false, fodmap: false,
    ing: [I("Potato","3, boiled"),I("Carrot","2, boiled"),I("Cauliflower","½, boiled"),I("Beans","10, boiled"),I("Frozen peas","½ cup"),I("Onion","2 (1 mashed-veg, 1 for cooking)"),I("Tomato","2"),I("Salted butter","50g + extra"),I("Red chilli powder","1 tsp"),I("Turmeric","½ tsp"),I("Coriander powder","1 tsp"),I("Ginger garlic paste","1.5 tsp"),I("Capsicum","1"),I("Pav bhaji masala","to taste"),I("Cilantro","to garnish"),I("Lemon","to serve"),I("Pav","to serve")],
    steps: ["Boil and mash potatoes, carrots, cauliflower, beans, peas.","Melt butter; add chilli powder, turmeric, coriander powder.","Add finely chopped onion, sauté with a little water.","Add ginger garlic paste, cook off raw smell.","Add chopped tomatoes + water, cook till mushy.","Add chopped capsicum, cook 1 min.","Add mashed veg, pav bhaji masala, salt; simmer.","Garnish with coriander; serve with pav, lemon, chopped onion, butter."] },

  { name: "Rasam", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Tomato","1, boiled & smashed"),I("Toor dhal","~100 ml dal water"),I("Tamarind paste","~75 ml tamarind water"),I("Sambar powder","2 tsp"),I("Asafotida","a pinch"),I("Pepper jeera powder","to taste"),I("Ghee","for tadka"),I("Mustard","for tadka"),I("Cumin seeds","for tadka"),I("Cilantro","to garnish")],
    steps: ["Smash boiled tomato into the pan.","Add dal water, tamarind water, salt, sambar powder, asafotida.","Cover and let it boil; remove from flame.","Add pepper-jeera powder.","Tadka with ghee, mustard, jeera; add coriander leaves."] },

  { name: "Sambar", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Groundnut oil","2 tbsp"),I("Mustard","½ tsp"),I("Asafotida","a pinch"),I("Fenugreek seeds","pinch (fenugreek)"),I("Curry leaves","few"),I("Bhindi","or veg of choice"),I("Brinjal","optional"),I("Carrot","optional"),I("Pearl onions","optional"),I("Drumstick","optional"),I("Toor dhal","¾ cup, cooked"),I("Tamarind paste","~150 ml tamarind water"),I("Cilantro","to garnish")],
    steps: ["Tadka: oil, mustard, asafotida, fenugreek powder, curry leaves.","Add vegetables of choice and sauté; salt + water per veg (none for okra/garlic; little for brinjal/onion/capsicum).","Add cooked dal (¾ cup).","Add tamarind water (~150 ml) and salt (~1.25 tsp).","Boil; garnish with coriander."] },

  { name: "Palak Kootu", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Toor dhal","½ cup, cooked"),I("Coconut","1 small lid"),I("Cumin seeds","1 tsp"),I("Green chilli","2-3"),I("Peppercorns","2-3 corns"),I("Roasted gram","2-3 tsp"),I("Coconut oil","for tadka"),I("Mustard","for tadka"),I("Asafotida","a pinch"),I("Dry red chilli","1-2"),I("Spinach","cut, 1 bunch")],
    steps: ["Cook ½ cup toor dal.","Grind coconut, jeera, green chilli, pepper, odachakadalai into a paste.","Tadka: coconut oil, mustard, asafotida, jeera, dry chilli.","Add cut palak, cooked dal, the paste, salt; simmer."] },

  { name: "Channa Masala", meal: ["lunch","dinner"], cuisine: "North Indian", protein: true, fodmap: false,
    ing: [I("Channa","1 cup, soaked 8h"),I("Onion","1"),I("Tomato","2 cups puree"),I("Green chilli","1, slit"),I("Ghee","for cooking"),I("Elaichi full","3 pods"),I("Bay leaf","1"),I("Cumin seeds","1 tsp"),I("Ginger garlic paste","1 tsp"),I("Channa masala","1 tsp"),I("Cilantro","to garnish"),I("Lemon","to serve")],
    steps: ["Soak channa 8h; pressure-cook 10 min with salt.","Ghee + elaichi, bay leaf, jeera.","Add chopped onion, sauté; add slit chilli.","Add ginger garlic paste, brown well.","Add channa masala + salt; add tomato puree, cook till oil separates.","Add cooked channa + water; cook 10 min.","Garnish coriander; serve with onion + lemon."] },

  { name: "Paruppu Usili", meal: ["lunch","dinner"], cuisine: "South Indian", protein: true, fodmap: false,
    ing: [I("Toor dhal","1 cup, soaked"),I("Channa dal","¼ cup, soaked"),I("Dry red chilli","6"),I("Green chilli","2"),I("Cilantro","few"),I("Curry leaves","few"),I("Turmeric","pinch"),I("Asafotida","pinch"),I("Beans","250g"),I("Groundnut oil","for tadka"),I("Mustard","for tadka"),I("Black urad dal","for tadka")],
    steps: ["Soak toor dal + chana dal + dry chilli 1h in hot water.","Coarse-grind with salt, coriander, curry leaves, turmeric, asafotida (minimal water).","Steam as vada, then crumble in mixer to make usili.","Boil 250g beans with salt.","Tadka: oil, mustard, asafotida, chana dal, urad dal, dry chilli; add beans then usili, fry 5 min."] },

  { name: "Morkuzhambu", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Coriander seeds","2 tsp, soaked"),I("Toor dhal","2 tsp, soaked"),I("Cumin seeds","2 tsp"),I("Green chilli","6"),I("Ginger","small piece"),I("Coconut","4 tsp"),I("Coconut oil","for tadka"),I("Mustard","for tadka"),I("Turmeric","½ tsp"),I("Asafotida","pinch"),I("Curry leaves","few"),I("Cilantro","few"),I("Bhindi","cut, 1 cup"),I("Curd","100 ml")],
    steps: ["Soak dhaniya + toor dal 2h; grind with jeera, green chilli, ginger, coconut into paste.","Coconut oil tadka: mustard, jeera, turmeric, asafotida, curry + coriander leaves.","Add cut okra, pinch salt, sauté till roasted.","Add 100 ml curd, cook 1 min.","Add masala paste + salt; boil once only."] },

  { name: "Sesame Noodles", meal: ["dinner"], cuisine: "Chinese", protein: false, fodmap: false,
    ing: [I("Lo mein noodles","2-3 sets"),I("Tahini","6 tbsp"),I("Sesame oil","1.5 tbsp"),I("Soy sauce","4 tbsp"),I("Sugar","1.5 spoons"),I("Black vinegar","4 tbsp"),I("Spring onion","to garnish"),I("Sesame seeds","toasted, to garnish"),I("Chilli oil","to garnish"),I("Blanched peanuts","crushed, to garnish")],
    steps: ["Boil noodles 3 min; drain, reserve the water.","Sauce: whisk tahini, sesame oil, soy sauce, sugar, black vinegar.","Whisk in ~16 tbsp noodle water to adjust consistency.","Toss hot noodles in sauce.","Garnish scallions, toasted sesame, chilli oil, crushed peanuts."] },

  { name: "Palak Paneer", meal: ["lunch","dinner"], cuisine: "North Indian", protein: true, fodmap: false,
    ing: [I("Paneer","cut, soaked"),I("Onion","1 medium"),I("Tomato","1"),I("Spinach","½ box baby spinach"),I("Ginger","1 inch"),I("Garlic","4 cloves"),I("Green chilli","5 small"),I("Cumin seeds","1 tsp"),I("Cinnamon","1 piece"),I("Elaichi full","3-4 pods"),I("Bay leaf","1"),I("Kasuri methi","1 tsp + extra"),I("Ghee","for cooking"),I("Garam masala","½ tsp"),I("Fresh Cream","to finish")],
    steps: ["Soak cut paneer in warm salt water.","Blanch spinach 2-3 min; cool in cold water.","Blend spinach with ginger, garlic, green chilli.","Optionally fry paneer; set aside.","Ghee + jeera, cinnamon, elaichi, bay leaf, kasuri methi.","Sauté onion, then tomato till mushy.","Add palak paste, salt, water; add paneer; simmer 5 min.","Finish with garam masala, kasuri methi, fresh cream."] },

  { name: "Aloo Gobi", meal: ["lunch","dinner"], cuisine: "North Indian", protein: false, fodmap: false,
    ing: [I("Groundnut oil","for roasting & tempering"),I("Cauliflower","15 florets"),I("Potato","1, cubed"),I("Tomato","1"),I("Cashews","5-7"),I("Onion","1"),I("Cumin seeds","for tadka"),I("Cinnamon","1 piece"),I("Cloves","2"),I("Ginger garlic paste","1 tbsp"),I("Turmeric","½ tsp"),I("Red chilli powder","1 tsp"),I("Cumin powder","½ tsp"),I("Coriander powder","½ tsp"),I("Curd","2 tbsp"),I("Garam masala","½ tsp"),I("Cilantro","to garnish"),I("Kasuri methi","to garnish")],
    steps: ["Roast cauliflower and potato in oil on medium.","Grind tomato + cashews to puree.","Oil + jeera, cinnamon, cloves; sauté onion.","Add ginger garlic paste; brown.","Add turmeric, chilli, cumin, coriander powders + salt.","Add tomato-cashew puree; cook till oil separates; add curd.","Add fried cauliflower + potato, 1 cup water; cook 10 min.","Finish garam masala, coriander, kasuri methi."] },

  { name: "Creamy Mushroom", meal: ["lunch","dinner"], cuisine: "Continental", protein: false, fodmap: false,
    ing: [I("Baby bella mushrooms","1 small pack"),I("Garlic","~50% of mushroom"),I("Salted butter","2 tbsp"),I("Italian seasoning","to taste"),I("Basil leaves","few"),I("Heavy whipping cream","as needed"),I("Milk","½ cup"),I("Parmesan cheese","grated, to taste"),I("Bread","to serve")],
    steps: ["Clean, peel and cube mushrooms; chop garlic.","Butter + garlic, roast light brown; add mushrooms.","Add salt, Italian seasoning, basil; mushrooms release water.","After 2-3 min add whipping cream + milk; simmer creamy.","Stir in grated parmesan; serve with toasted bread."] },

  { name: "Akki Usili", meal: ["breakfast","lunch"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Crystal sona masoori rice","1 cup"),I("Moong dal","½ cup"),I("Coconut","¼ cup"),I("Coconut oil","for tadka"),I("Mustard","for tadka"),I("Cumin seeds","for tadka"),I("Urad dal","for tadka"),I("Channa dal","for tadka"),I("Asafotida","pinch"),I("Curry leaves","few"),I("Dry red chilli","1"),I("Green chilli","1")],
    steps: ["Dry-roast rice and moong dal separately on tawa.","Add salt and coconut.","Tadka: coconut oil, mustard, jeera, urad dal, chana dal, asafotida, curry leaves, dry + green chilli.","Cook everything in Instapot (usual water + time)."] },

  { name: "Jalfrezi", meal: ["lunch","dinner"], cuisine: "North Indian", protein: false, fodmap: false,
    ing: [I("Salted butter","1 tbsp"),I("Groundnut oil","for tadka"),I("Onion","1 (½ petals, ½ chopped)"),I("Beans","10"),I("Carrot","½, striped"),I("Tomato","2-2.5 total"),I("Frozen peas","3 spoons"),I("Baby corn","5, chopped"),I("Capsicum","1.5, strips"),I("Cumin seeds","1 tsp"),I("Kasuri methi","1 tsp"),I("Garlic","3, chopped"),I("Ginger","1 inch, julienne"),I("Green chilli","1, slit"),I("Turmeric","½ tsp"),I("Red chilli powder","1 tsp"),I("Coriander powder","1 tsp"),I("Tomato ketchup","2 spoons"),I("Garam masala","½ tsp"),I("Pepper powder","¼ tsp"),I("Cilantro","to garnish")],
    steps: ["Butter; sauté onion petals, beans, carrot, tomato strips, peas, baby corn, capsicum on high 5 min; set aside.","Oil tadka: jeera, kasuri methi, garlic, ginger, slit chilli.","Add chopped onion, brown.","Add turmeric, chilli powder, coriander powder, salt, chopped tomato; cook mushy.","Add ketchup, then sautéed veg, garam masala, pepper; toss on high.","Garnish coriander."] },

  { name: "Vegetable Pulao", meal: ["lunch","dinner"], cuisine: "North Indian", protein: false, fodmap: false,
    ing: [I("Cilantro","½ cup"),I("Mint leaves","¼ cup"),I("Ginger","1 inch"),I("Garlic","2 cloves"),I("Green chilli","2"),I("Elaichi full","2"),I("Cinnamon","1 inch"),I("Cloves","3-5"),I("Fennel seeds","1 spoon"),I("Onion","½, sliced"),I("Tomato","½, diced"),I("Beans","few"),I("Potato","½"),I("Frozen peas","¼ cup"),I("Carrot","½"),I("Capsicum","½"),I("Ghee","2 spoons"),I("Cumin seeds","for tempering"),I("Bay leaf","1"),I("Cashews","few"),I("Peppercorns","½ spoon"),I("Basmati rice","cooked")],
    steps: ["Grind coriander, mint, ginger, garlic, green chilli, cardamom, cinnamon, fennel into paste.","Steam beans, potato, peas, carrot, capsicum.","Ghee + jeera, cinnamon, bay leaf, cardamom, cloves, pepper, cashews on low.","Sauté sliced onion till light brown; add diced tomato.","Add cooked veg, then the paste; cook 2 min.","Mix in cooked rice."] },

  { name: "Avocado Pasta", meal: ["lunch","dinner"], cuisine: "Continental", protein: false, fodmap: false,
    ing: [I("Avocado","1, scooped"),I("Basil leaves","1 box (~15g)"),I("Lemon","~½ (3-4 spoons juice)"),I("Olive oil","2 spoons"),I("Garlic","2 cloves"),I("Pepper powder","to taste"),I("Pasta","cooked"),I("Chilli flakes","to garnish"),I("Italian seasoning","to garnish"),I("Cheese","to garnish")],
    steps: ["Grind avocado, basil, lemon juice, olive oil, garlic, salt, pepper.","Cook pasta ~15 min.","Toss pasta in the avocado sauce.","Garnish chilli flakes, seasoning, cheese."] },

  { name: "Moong Dal Gravy", meal: ["lunch","dinner"], cuisine: "South Indian", protein: true, fodmap: false,
    ing: [I("Moong dal","1 cup"),I("Turmeric","pinch"),I("Green chilli","3, split"),I("Groundnut oil","for tadka"),I("Toor dhal","for tadka"),I("Dry red chilli","optional"),I("Lemon","to finish")],
    steps: ["Cook 1 cup moong dal with turmeric (Instapot 5 min).","Tadka: oil, toor dal, 3 split chillies.","Squeeze lemon to finish."] },

  { name: "Paneer Butter Masala", meal: ["lunch","dinner"], cuisine: "North Indian", protein: true, fodmap: false,
    ing: [I("Paneer","soaked, cubed"),I("Onion","1"),I("Tomato","3-4"),I("Ginger","1 inch"),I("Garlic","3 cloves"),I("Cashews","5-7"),I("Salted butter","for cooking"),I("Elaichi full","2 pods"),I("Bay leaf","1"),I("Cinnamon","1 piece"),I("Red chilli powder","1 spoon"),I("Garam masala","½ spoon"),I("Sugar","½ spoon"),I("Kasuri methi","to finish")],
    steps: ["Soak paneer in warm salt water.","Butter; sauté onion till translucent.","Add tomato, cashews, ginger, garlic; cook mushy; cool and grind (add water).","Butter + elaichi, bay leaf, cinnamon; add the paste.","Add salt, chilli powder, garam masala, sugar; cook 5 min.","Add paneer, cook 2 min; finish kasuri methi."] },

  { name: "Mint Chutney", meal: ["breakfast","lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Black urad dal","2 spoons"),I("Dry red chilli","1"),I("Ginger","small piece"),I("Tamarind paste","small"),I("Green chilli","2"),I("Coconut","2 spoons"),I("Mint leaves","1 bunch"),I("Mustard","for tadka"),I("Asafotida","pinch"),I("Channa dal","for tadka")],
    steps: ["Dry-roast urad dal + dry chilli.","Add ginger, tamarind paste, green chilli, coconut.","Sauté mint leaves separately.","Grind with salt (minimal water).","Tadka: mustard, asafotida, chana dal."] },

  { name: "Pongal", meal: ["breakfast"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Crystal sona masoori rice","1 part"),I("Moong dal","1 part"),I("Asafotida","pinch"),I("Pepper powder","to taste"),I("Peppercorns","for tempering in ghee"),I("Cashews","for tempering"),I("Cumin seeds","for tempering"),I("Ghee","for tempering"),I("Curry leaves","few"),I("Ginger","grated")],
    steps: ["Wash rice + moong dal 1:1, add 1:3 water (e.g. 1+1 cup → 6 cups).","Add salt, asafotida, pepper; cook long.","Fry cashews, jeera, peppercorns in ghee; add curry leaves and grated ginger."] },

  { name: "Vangi Bath", meal: ["lunch"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Brinjal","striped purple type"),I("Tamarind paste","1 spoon"),I("Coriander seeds","2 tsp"),I("Channa dal","1 tsp"),I("Black urad dal","½ tsp"),I("Cumin seeds","½ tsp"),I("Peppercorns","¼ tsp"),I("Fenugreek seeds","10 pieces"),I("Dry red chilli","5"),I("Coconut","4 tsp"),I("Asafotida","pinch"),I("Mustard","for tadka"),I("Green chilli","2"),I("Turmeric","pinch"),I("Jaggery","small piece"),I("Groundnut oil","for tadka"),I("Cilantro","to garnish"),I("Crystal sona masoori rice","cooked")],
    steps: ["Cut brinjal into salt water; keep tamarind paste ready.","Roast dhaniya, chana dal, urad dal, jeera, pepper, fenugreek, dry chilli, coconut, asafotida; grind to masala.","Tadka: mustard, dals, asafotida, green chilli, turmeric.","Add brinjal, sauté on medium; salt; cook 7-10 min.","Add tamarind paste, jaggery; cook 5-7 min.","Add masala and cooked rice; garnish coriander."] },

  { name: "Dal Makhani", meal: ["lunch","dinner"], cuisine: "North Indian", protein: true, fodmap: false,
    ing: [I("Black urad dal","1 cup, soaked 8h"),I("Rajma","¼ cup, soaked 8h"),I("Turmeric","¼ tsp"),I("Red chilli powder","1 spoon"),I("Salted butter","for cooking"),I("Tomato","2, puree"),I("Ginger garlic paste","2 spoons"),I("Cumin seeds","for tempering"),I("Asafotida","pinch"),I("Coriander powder","1 spoon"),I("Cumin powder","½ spoon"),I("Garam masala","½ spoon"),I("Kasuri methi","to finish"),I("Fresh Cream","to finish"),I("Ghee","for tempering")],
    steps: ["Soak urad dal + rajma 8h; pressure-cook 10-12 min with salt, turmeric, chilli, butter; mash lightly.","Ghee + butter, jeera, asafotida.","Add ginger paste, sauté; add turmeric, chilli powder.","Add 2 cups tomato puree; cook till oil separates.","Add coriander + jeera powder.","Add cooked dal, water, salt; cook 10 min.","Finish garam masala, kasuri methi, fresh cream, butter."] },

  { name: "Peanut Chutney", meal: ["breakfast","lunch"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Blanched peanuts","1.3 cups, roasted"),I("Roasted gram","~⅓ of peanuts"),I("Garlic","6 cloves"),I("Curry leaves","few"),I("Green chilli","8"),I("Coconut","3 spoons"),I("Tamarind paste","2 spoons"),I("Groundnut oil","for roasting & tadka"),I("Mustard","for tadka")],
    steps: ["Roast peanuts; roast green chillies in oil.","Grind peanuts, chillies, tamarind paste, garlic with salt + water.","Tadka with mustard in the chilli oil."] },

  { name: "Kadai Paneer", meal: ["lunch","dinner"], cuisine: "North Indian", protein: true, fodmap: false,
    ing: [I("Paneer","cubed"),I("Onion","2-3 total"),I("Tomato","3-5 total"),I("Capsicum","½-1"),I("Garlic","5 cloves"),I("Ginger","1 inch + julienne"),I("Coriander seeds","2 tsp"),I("Cumin seeds","2 tsp"),I("Fennel seeds","2 tsp"),I("Peppercorns","2 tsp"),I("Dry red chilli","3"),I("Groundnut oil","2 spoons, with ghee"),I("Ghee","for cooking"),I("Turmeric","½ tsp"),I("Red chilli powder","1 spoon"),I("Garam masala","1 tsp"),I("Fresh Cream","to finish"),I("Kasuri methi","to finish"),I("Cilantro","to garnish")],
    steps: ["Kadai masala: dry-roast coriander, jeera, fennel, pepper, dry chilli; coarse-grind.","Oil+ghee, cumin; add chopped garlic + ginger, sauté.","Add finely chopped onion, brown; turmeric, chilli powder + kadai masala, salt.","Add chopped tomato; cook mushy, oil separates.","Separately sauté onion/capsicum/tomato petals + paneer with garam masala on high.","Combine with the paste, add water, cook 2 min.","Finish cream, kasuri methi, coriander, julienne ginger."] },

  { name: "Brinjal Gojju", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Coriander seeds","4 spoons"),I("Channa dal","2 spoons"),I("Urad dal","2 spoons"),I("Peppercorns","1 spoon"),I("Cumin seeds","1 spoon"),I("Dry red chilli","5"),I("Brinjal","3, cut"),I("Tomato","1"),I("Asafotida","pinch"),I("Turmeric","pinch"),I("Tamarind paste","1 spoon"),I("Groundnut oil","for tadka")],
    steps: ["Dry-roast coriander, chana dal, urad dal, pepper, jeera, dry chilli; powder it.","Tadka with dals, asafotida, turmeric.","Add brinjal, sauté.","Add tomato, smash.","Add tamarind paste, water, salt and the curry powder."] },

  { name: "Bisibelebath", meal: ["lunch","dinner"], cuisine: "South Indian", protein: false, fodmap: false,
    ing: [I("Toor dhal","½ cup, soaked"),I("Onion","½, cubed"),I("Carrot","1"),I("Potato","1, cubed"),I("Frozen peas","¼ cup"),I("Beans","5"),I("Tomato","½"),I("Coriander seeds","¼ cup"),I("Channa dal","¼ cup"),I("Urad dal","2 tbsp"),I("Cumin seeds","2 tbsp"),I("Fenugreek seeds","½ tsp"),I("Sesame seeds","2 tbsp"),I("Poppy seeds","2 tbsp"),I("Peppercorns","½ tsp"),I("Elaichi full","6 pods"),I("Cinnamon","2 inch"),I("Cloves","5"),I("Dry red chilli","20"),I("Kopparai","¼ cup dry coconut"),I("Turmeric","½ tsp"),I("Asafotida","¼ tsp"),I("Crystal sona masoori rice","½ cup"),I("Ghee","2 tbsp"),I("Groundnut oil","1 tsp, for masala roast & rice"),I("Mustard","for tadka"),I("Blanched peanuts","to roast"),I("Tamarind paste","½ cup tamarind water"),I("Red chilli powder","1 tsp"),I("Cashews","fried, to finish")],
    steps: ["Masala: roast coriander, chana dal, urad dal, cumin, methi, sesame, poppy, pepper, cardamom, cinnamon, cloves; then dry chilli + dry coconut in oil till crisp; add turmeric, asafotida; cool & grind fine.","Cook ½ cup rice + ½ cup soaked toor dal with 3 cups water, turmeric, oil ~10 min.","Ghee tadka: mustard, dry chilli, asafotida, roast peanuts; sauté onion.","Add veg, turmeric, salt; sauté; add water, cook 10 min.","Add ½ cup tamarind water, 3 tbsp masala, 1 tsp chilli powder.","Add cooked rice+dal; simmer 10 min; top with fried cashews."] },
];

// --- write recipe notes ---
fs.mkdirSync(RECIPES, { recursive: true });
const allIngredients = new Set();
for (const r of recipes) {
  const fm = `---\ntype: recipe\nmeal: [${r.meal.join(", ")}]\ncuisine: ${r.cuisine}\nprotein_heavy: ${r.protein}\nfodmap_friendly: ${r.fodmap}\n---\n`;
  const ing = "## Ingredients\n" + r.ing.map(x => { allIngredients.add(x.item); return `- [[${x.item}]] | ${x.amount}`; }).join("\n") + "\n";
  const dir = "\n## Directions\n" + r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") + "\n";
  fs.writeFileSync(path.join(RECIPES, `${r.name}.md`), fm + ing + dir);
}

// --- verify every ingredient link resolves to an existing item ---
const orphans = [...allIngredients].filter(i => !existing.has(i)).sort();
if (orphans.length) {
  console.error("ORPHAN ingredient links (no item note):", orphans.join(", "));
  process.exitCode = 1;
}

// --- cooking references note ---
const refs = `# Cooking References

Ratios and timings — not dishes (no grocery list generated from these).

## Basmati rice
- Soak 20-30 min. Hotpot: ~1.5-2x water, 5 min. Salt ~half-70% of a Chipotle spoon.
- Stovetop: soak 20 min, boil water, add rice, cook 5 min, add a little oil.

## Upma ratios (for 2)
- Rava upma: 2/3 cup rava, water 1:2.5 to 1:3.
- Arisi upma: 1 rice-cup, water 1:2.5.
- Semiya upma: standard.
- Rava idli: 2 cups semolina, 1 cup Greek yogurt, 1 cup water (+ a few spoons later) → ~18 idlis.

## Instapot timings
- Regular rice & dal: 6-7 min; rice 2x water; dal submerged.
- Basmati rice: soak 25 min, 5 min, 1.5-1.75x water.
- Channa: soak overnight, 10 min, submerged.

## Soya chunks (prep)
- Boil 1 cup soya chunks in hot water with 1 tsp salt for 5 min.
`;
fs.writeFileSync(path.join(BUNDLE, "Cooking References.md"), refs);

console.log(`Wrote ${recipes.length} recipe notes.`);
console.log(`Unique ingredients referenced: ${allIngredients.size}`);
console.log(`Orphan links: ${orphans.length}`);
