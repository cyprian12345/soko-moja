const db = require('./database.js');

db.serialize(() => {
    // Clear existing data
    db.run("DELETE FROM products");
    db.run("DELETE FROM categories");

    // Insert sample categories
    const categories = [
        { name: "Fruits", image_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400", description: "Fresh seasonal fruits from local farms" },
        { name: "Vegetables", image_url: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400", description: "Organic vegetables grown naturally" },
        { name: "Grains", image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", description: "Whole grains and cereals" },
        { name: "Dairy", image_url: "https://images.unsplash.com/photo-1628088062854-d1874a45b9d5?w=400", description: "Fresh dairy products" },
        { name: "Meat", image_url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400", description: "Premium quality meat" },
        { name: "Spices", image_url: "https://images.unsplash.com/photo-1532335692676-99c790782bb2?w=400", description: "Aromatic spices and seasonings" }
    ];

    categories.forEach(cat => {
        db.run("INSERT INTO categories (name, image_url, description) VALUES (?, ?, ?)",
            [cat.name, cat.image_url, cat.description]);
    });

    // Insert sample products
    const products = [
        { name: "Fresh Apples", category: "Fruits", price: 2.99, image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", description: "Crisp and sweet red apples, perfect for snacking" },
        { name: "Organic Bananas", category: "Fruits", price: 1.49, image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400", description: "Ripe and ready to eat bananas" },
        { name: "Fresh Oranges", category: "Fruits", price: 3.99, image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", description: "Juicy navel oranges packed with vitamin C" },
        { name: "Organic Carrots", category: "Vegetables", price: 1.99, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5ae37?w=400", description: "Sweet and crunchy organic carrots" },
        { name: "Fresh Tomatoes", category: "Vegetables", price: 2.49, image_url: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400", description: "Vine-ripened tomatoes, perfect for salads" },
        { name: "Green Broccoli", category: "Vegetables", price: 2.99, image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400", description: "Fresh and nutritious broccoli heads" },
        { name: "Brown Rice", category: "Grains", price: 4.99, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400", description: "Whole grain brown rice, high in fiber" },
        { name: "Whole Wheat Bread", category: "Grains", price: 3.49, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", description: "Freshly baked whole wheat bread" },
        { name: "Fresh Milk", category: "Dairy", price: 3.99, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", description: "Farm fresh whole milk" },
        { name: "Cheddar Cheese", category: "Dairy", price: 5.99, image_url: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400", description: "Aged cheddar cheese block" }
    ];

    products.forEach(prod => {
        db.run("INSERT INTO products (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)",
            [prod.name, prod.category, prod.price, prod.image_url, prod.description]);
    });

    console.log("✅ Database seeded successfully with images!");

    // Verify
    db.all("SELECT COUNT(*) as count FROM products", (err, row) => {
        console.log(`📦 Products in database: ${row[0].count}`);
    });
    db.all("SELECT COUNT(*) as count FROM categories", (err, row) => {
        console.log(`🏷️ Categories in database: ${row[0].count}`);
    });
});

setTimeout(() => {
    db.close();
}, 1000);