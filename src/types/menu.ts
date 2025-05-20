// src/types/menu.ts
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; // Image URL is now more prominent
  }
  
  export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
  }

  // We'll also need a type for items *in* the cart, which includes quantity
export interface CartItem extends MenuItem {
  quantity: number;
}



/*  
menuCategories{
id=sS65d8idZiud8asdwa56s1d{

Appetizers{
id=3gE9asdwaXsdgjhgjry53{
description
"Crispy vegetable spring rolls with sweet chili sauce rolls with sweet chili sauce ."
(string)

imageUrl
"\images\pexels-robinstickel-70497.jpg"
(string)

name
"Spring Rolls"
(string)

price
8.9
}
},

Desserts{
id=3gE9asdwaklfgjhgj456{
description
"Classic Italian coffee-flavored dessert. "
(string)

imageUrl
"\images\pexels-robinstickel-70497.jpg"
(string)

name
"Tiramisu"
(string)

price
8.75
}}
Main Courses{
id=wasdwa4sd5asdwa6456{
description
"Grilled steak with french fries. "
(string)

imageUrl
"\images\pexels-fotios-photos-1279330.jpg"
(string)

name
"Steak Frites "
(string)

price
28
}}
}}
*/
