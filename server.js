const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/fruitsDB';

// הגדרת סכימה
const fruitSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    qty: Number,
    rating: Number,
    microsieverts: Number
});

const Fruit = mongoose.model('Fruit', fruitSchema);

// פונקציית Seed להזנת נתונים ראשונית (לפי דרישת התרגיל)
async function seedDatabase() {
    const data = [
        { "_id": 1, "name": "apples", "qty": 5, "rating": 3 },
        { "_id": 2, "name": "bananas", "qty": 7, "rating": 1, "microsieverts": 0.1 },
        { "_id": 3, "name": "oranges", "qty": 6, "rating": 2 },
        { "_id": 4, "name": "avocados", "qty": 3, "rating": 5 }
    ];

    for (const item of data) {
        await Fruit.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
    }
    console.log("Database seeded successfully");
}

//MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        seedDatabase();
    })
    .catch(err => console.error("Could not connect to MongoDB", err));

// Endpoint להצגת התפוחים
app.get('/', async (req, res) => {
    try {
        const apples = await Fruit.findOne({ name: "apples" });
        const count = apples ? apples.qty : 0;
        res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; margin-top: 50px;">
                    <h1>Hello World! 🍎</h1>
                    <p>There are <strong>${count}</strong> apples in the inventory.</p>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));