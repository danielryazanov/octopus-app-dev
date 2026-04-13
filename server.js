const express = require('express');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus Setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://octopus_user:YJpn6ZTdPdIbNBXq@danielmongo.3yle095.mongodb.net/test?retryWrites=true&w=majority&appName=danielMongo';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema - מותאם למבנה הקיים ב-Atlas (שדה qty ותיקיית fruits)
const itemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) { return /^[a-zA-Zא-ת\s]+$/.test(v); },
            message: "שם חייב להכיל אותיות בלבד!"
        }
    },
    qty: { type: Number, min: 0, default: 0 }, // מונע שלילי במסד הנתונים
    idealStock: { type: Number, min: 0, default: 10 }
}, { collection: 'fruits' }); // ככה הוא מוצא את הנתונים הקיימים שלך

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        let rows = items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 15px; display: flex; align-items: center; justify-content: space-between; width: 600px; background: white; margin-bottom: 5px; border-radius: 8px;">
                <div style="width: 150px;"><strong style="font-size: 1.1em;">${item.name}</strong></div>
                <div style="color: #666; font-size: 0.9em;">יעד: <span id="ideal-${item._id}">${item.idealStock || 10}</span>*</div>
                <div>
                    <button onclick="updateQty('${item._id}', -1)" style="padding: 5px 12px; cursor: pointer;">-</button>
                    <span id="qty-${item._id}" style="margin: 0 15px; font-weight: bold; width: 30px; display: inline-block; text-align: center;">${item.qty || 0}</span>
                    <button onclick="updateQty('${item._id}', 1)" style="padding: 5px 12px; cursor: pointer;">+</button>
                </div>
                <button onclick="saveQty('${item._id}')" style="background: #28a745; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;">שמור</button>
            </div>
        `).join('');

        res.send(`
            <html>
                <head>
                    <title>Octopus Smart Inventory</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: system-ui; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 40px; direction: rtl; }
                        .form-box { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; width: 600px; }
                        input { padding: 12px; margin: 5px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
                        .btn-add { background: #007bff; color: white; border: none; padding: 12px; cursor: pointer; width: 100%; border-radius: 6px; font-weight: bold; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <h1>hello world</h1>
                    <h2>ניהול מלאי חכם 🛒</h2>
                    <div class="form-box">
                        <h3 style="margin-top: 0;">➕ הוספת פריט חדש</h3>
                        <input type="text" id="newName" placeholder="שם הפריט (אותיות בלבד)" style="width: 96%;">
                        <div style="display: flex; gap: 10px;">
                            <input type="number" id="newCurrent" min="0" placeholder="כמות במלאי" style="width: 50%;">
                            <input type="number" id="newIdeal" min="0" placeholder="כמות יעד" style="width: 50%;">
                        </div>
                        <button class="btn-add" onclick="addNewItem()">הוסף למערכת</button>
                    </div>
                    <div id="inventory-list">${rows || '<p>טוען נתונים...</p>'}</div>

                    <script>
                        function updateQty(id, change) {
                            const el = document.getElementById('qty-' + id);
                            let val = parseInt(el.innerText) + change;
                            // מניעת מספר שלילי בעדכון מלאי קיים
                            if (val >= 0) {
                                el.innerText = val;
                            } else {
                                alert("המלאי לא יכול להיות נמוך מ-0!");
                            }
                        }

                        async function saveQty(id) {
                            const current = parseInt(document.getElementById('qty-' + id).innerText);
                            const ideal = parseInt(document.getElementById('ideal-' + id).innerText);
                            
                            if (current > ideal) {
                                alert('שים לב: חריגה של ' + (current - ideal) + ' מהכמות האידיאלית!');
                            }
                            
                            await fetch('/api/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id, newQty: current })
                            });
                            alert('המלאי נשמר ב-Atlas!');
                        }

                        async function addNewItem() {
                            const name = document.getElementById('newName').value;
                            const current = parseInt(document.getElementById('newCurrent').value);
                            const ideal = parseInt(document.getElementById('newIdeal').value);

                            // בדיקת שם - אותיות בלבד
                            if (!/^[a-zA-Zא-ת\\s]+$/.test(name)) {
                                return alert('שגיאה: שם הפריט חייב להכיל אותיות בלבד (ללא מספרים או תווים)!');
                            }

                            // מניעת מספר שלילי בהוספה
                            if (current < 0 || ideal < 0) {
                                return alert('שגיאה: הכמות אינה יכולה להיות שלילית!');
                            }

                            const response = await fetch('/api/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, qty: current, idealStock: ideal })
                            });
                            
                            if (response.ok) {
                                alert('הפריט נוסף בהצלחה!');
                                window.location.reload();
                            } else {
                                const err = await response.json();
                                alert('שגיאה: ' + err.message);
                            }
                        }
                    </script>
                </body>
            </html>
        `);
    } catch (e) { res.status(500).send("Error: " + e.message); }
});

app.post('/api/save', async (req, res) => {
    const { id, newQty } = req.body;
    await Item.findByIdAndUpdate(id, { qty: Math.max(0, newQty) });
    res.sendStatus(200);
});

app.post('/api/add', async (req, res) => {
    try {
        const { name, qty, idealStock } = req.body;
        const newItem = new Item({ name, qty, idealStock });
        await newItem.save();
        res.sendStatus(201);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));