const express = require('express');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// --- הגדרות Prometheus ---
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// מדד 1: סופר כמה עדכוני מלאי בוצעו (Counter)
const updatesCounter = new client.Counter({
  name: 'inventory_updates_total',
  help: 'Total number of stock updates performed'
});

// מדד 2: מראה כמה מוצרים שונים יש במערכת (Gauge)
const itemsGauge = new client.Gauge({
  name: 'inventory_items_count',
  help: 'Total number of unique items in the inventory'
});
// --------------------------

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://octopus_user:YJpn6ZTdPdIbNBXq@danielmongo.3yle095.mongodb.net/test?retryWrites=true&w=majority&appName=danielMongo';
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // עדכון ראשוני של המדד לפי מה שיש ב-DB
        Item.countDocuments().then(count => itemsGauge.set(count));
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Schema - מק"ט כמספר ייחודי
const itemSchema = new mongoose.Schema({
    _id: { type: Number, required: true }, 
    name: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) { return /^[a-zA-Zא-ת\s]+$/.test(v) && !/[0-9]/.test(v); },
            message: "שם חייב להכיל אותיות בלבד!"
        }
    },
    qty: { type: Number, min: 0, default: 0 },
    idealStock: { type: Number, min: 0, default: 10 },
    rating: { type: Number, min: 0, max: 5, default: 0 }
}, { collection: 'fruits', versionKey: false });

const Item = mongoose.model('Item', itemSchema);

// פונקציית עזר לכוכבים
function getStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += '⭐';
        else if (rating >= i - 0.5) html += '🌗';
        else html += '☆';
    }
    return html;
}

// Routes
app.get('/', async (req, res) => {
    try {
        const items = await Item.find().sort({ _id: 1 });
        let rows = items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 15px; display: flex; align-items: center; justify-content: space-between; width: 750px; background: white; margin-bottom: 5px; border-radius: 8px;">
                <div style="width: 100px; color: #888;"><strong>מק"ט: ${item._id}</strong></div>
                <div style="width: 120px;"><strong>${item.name}</strong></div>
                <div style="width: 120px; color: #f39c12;">${getStarsHTML(item.rating)} (${item.rating})</div>
                <div style="color: #666;">יעד: <span id="ideal-${item._id}">${item.idealStock}</span>*</div>
                <div>
                    <button onclick="updateQty(${item._id}, -1)">-</button>
                    <span id="qty-${item._id}" style="margin: 0 10px; font-weight: bold; width: 25px; display: inline-block; text-align: center;">${item.qty}</span>
                    <button onclick="updateQty(${item._id}, 1)">+</button>
                </div>
                <button onclick="saveQty(${item._id})" style="background: #28a745; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">שמור</button>
                <button onclick="deleteItem(${item._id})" style="background: #dc3545; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">מחק</button>
            </div>
        `).join('');

        res.send(`
            <html dir="rtl">
            <head><meta charset="UTF-8"><style>body { font-family: system-ui; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 20px; }</style></head>
            <body>
                    <h1>hello world 🍎</h1>
                    <h2>ניהול מלאי חכם Octopus 🛒</h2>
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; width: 750px;">
                    <h3>➕ הוספת מוצר חדש</h3>
                    <input type="number" id="newSku" placeholder="מק"ט">
                    <input type="text" id="newName" placeholder="שם הפריט">
                    <select id="newRating">
                        ${[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => `<option value="${r}">${r} כוכבים</option>`).join('')}
                    </select>
                    <input type="number" id="newCurrent" placeholder="מלאי">
                    <input type="number" id="newIdeal" placeholder="יעד">
                    <button onclick="addNewItem()" style="background: #007bff; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 4px; width: 100%; margin-top: 10px;">הוסף למערכת</button>
                </div>
                <div>${rows}</div>
                <script>
                    function updateQty(id, change) {
                        const el = document.getElementById('qty-' + id);
                        let val = parseInt(el.innerText) + change;
                        if (val >= 0) el.innerText = val;
                    }
                    async function saveQty(id) {
                        const current = parseInt(document.getElementById('qty-' + id).innerText);
                        await fetch('/api/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id, newQty: current })
                        });
                        alert('נשמר!');
                    }
                    async function deleteItem(id) {
                        if (confirm('למחוק?')) {
                            await fetch('/api/delete/' + id, { method: 'DELETE' });
                            location.reload();
                        }
                    }
                    async function addNewItem() {
                        const sku = parseInt(document.getElementById('newSku').value);
                        const name = document.getElementById('newName').value;
                        const rating = parseFloat(document.getElementById('newRating').value);
                        const current = parseInt(document.getElementById('newCurrent').value);
                        const ideal = parseInt(document.getElementById('newIdeal').value);
                        const response = await fetch('/api/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sku, name, qty: current, idealStock: ideal, rating })
                        });
                        if (response.ok) location.reload(); else alert('שגיאה בהוספה');
                    }
                </script>
            </body></html>
        `);
    } catch (e) { res.status(500).send(e.message); }
});

// API: עדכון מלאי - מעלה את ה-Counter
app.post('/api/save', async (req, res) => {
    const { id, newQty } = req.body;
    await Item.updateOne({ _id: Number(id) }, { $set: { qty: Math.max(0, newQty) } });
    
    updatesCounter.inc(); // עדכון הניטור: עוד שמירה בוצעה
    res.sendStatus(200);
});

// API: הוספה - מעדכן את ה-Gauge
app.post('/api/add', async (req, res) => {
    try {
        const { sku, name, qty, idealStock, rating } = req.body;
        const newItem = new Item({ _id: Number(sku), name, qty, idealStock, rating });
        await newItem.save();
        
        const count = await Item.countDocuments();
        itemsGauge.set(count); // עדכון הניטור: יש פריט חדש במערכת
        
        res.sendStatus(201);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/delete/:id', async (req, res) => {
    await Item.deleteOne({ _id: Number(req.params.id) });
    const count = await Item.countDocuments();
    itemsGauge.set(count); // עדכון הניטור: פריט נמחק
    res.sendStatus(200);
});

// נתיב המדדים ל-Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));