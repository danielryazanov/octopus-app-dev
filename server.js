const express = require('express');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// --- חלק 1: הגדרות Prometheus (ללא שינוי ב-UI) ---
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const updatesCounter = new client.Counter({
  name: 'inventory_updates_total',
  help: 'Total number of stock updates performed'
});

const itemsGauge = new client.Gauge({
  name: 'inventory_items_count',
  help: 'Total number of unique items in the inventory'
});
// המדד החדש עם Labels
const stockGauge = new client.Gauge({
  name: 'inventory_stock_quantity',
  help: 'Quantity of specific item in stock',
  labelNames: ['name'] 
});

// פונקציית עזר שמעדכנת את כל הנתונים בבת אחת
async function updatePrometheusMetrics() {
    const items = await Item.find();
    items.forEach(item => {
        // מעדכן את המלאי לכל פריט לפי השם שלו
        stockGauge.set({ name: item.name }, item.qty);
    });
    // מעדכן את סך כל סוגי הפריטים
    itemsGauge.set(items.length);
}
// -----------------------------------------------

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://octopus_user:YJpn6ZTdPdIbNBXq@danielmongo.3yle095.mongodb.net/test?retryWrites=true&w=majority&appName=danielMongo';
mongoose.connect(mongoURI)
 .then(() => {
        console.log('Connected to MongoDB Atlas');
        // קריאה לפונקציה החדשה שטוענת את כל השמות והכמויות מיד עם החיבור
        updatePrometheusMetrics(); 
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Schema
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
                <div style="width: 100px; color: #888; font-size: 0.8em;">מק"ט: ${item._id}</div>
                <div style="width: 120px;"><strong>${item.name}</strong></div>
                <div style="width: 120px; color: #f39c12;">${getStarsHTML(item.rating)} (${item.rating})</div>
                <div style="color: #666; font-size: 0.85em;">יעד: <span id="ideal-${item._id}">${item.idealStock}</span>*</div>
                <div style="display: flex; align-items: center;">
                    <button onclick="updateQty(${item._id}, -1)" style="padding: 5px 10px; cursor: pointer;">-</button>
                    <span id="qty-${item._id}" style="margin: 0 10px; font-weight: bold; width: 25px; text-align: center;">${item.qty}</span>
                    <button onclick="updateQty(${item._id}, 1)" style="padding: 5px 10px; cursor: pointer;">+</button>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="saveQty(${item._id})" style="background: #28a745; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">שמור</button>
                    <button onclick="deleteItem(${item._id})" style="background: #dc3545; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">מחק</button>
                </div>
            </div>
        `).join('');

        res.send(`
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: system-ui; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 20px; }
                    .form-box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; width: 750px; }
                    input, select { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 6px; }
                    .btn-add { background: #007bff; color: white; border: none; padding: 12px; cursor: pointer; width: 100%; border-radius: 6px; font-weight: bold; }
                </style>
            </head>
            <body>
                    <h1>hello world 🍎</h1>
                    <h2>ניהול מלאי חכם Octopus 🛒</h2>
                <div class="form-box">
                    <h3>➕ הוספת מוצר חדש</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <input type="number" id="newSku" placeholder="מק"ט (מספר בלבד)" style="width: 20%;">
                        <input type="text" id="newName" placeholder="שם הפריט" style="width: 40%;">
                        <select id="newRating" style="width: 30%;">
                            <option value="0">בחר דירוג</option>
                            ${[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => `<option value="${r}">${r} כוכבים</option>`).join('')}
                        </select>
                        <input type="number" id="newCurrent" min="0" placeholder="מלאי" style="width: 47%;">
                        <input type="number" id="newIdeal" min="0" placeholder="יעד" style="width: 47%;">
                    </div>
                    <button class="btn-add" onclick="addNewItem()" style="margin-top:15px;">הוסף למערכת</button>
                </div>
                <div id="inventory-list">${rows}</div>
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
                        alert('המלאי עודכן!');
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
                        if (isNaN(sku) || !name || /[0-9]/.test(name)) return alert('בדוק תקינות מק"ט ושם');
                        const response = await fetch('/api/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sku, name, qty: current, idealStock: ideal, rating })
                        });
                        if (response.ok) location.reload(); else alert('שגיאה בהוספה');
                    }
                </script>
            </body>
            </html>
        `);
    } catch (e) { res.status(500).send(e.message); }
});

// --- חלק 2: עדכון המדדים בתוך ה-API (ללא שינוי ב-UI) ---
app.post('/api/save', async (req, res) => {
    const { id, newQty } = req.body;
    await Item.updateOne({ _id: Number(id) }, { $set: { qty: Math.max(0, newQty) } });
    
    await updatePrometheusMetrics(); // <--- זה השורה שמעדכנת את הגרפים
    updatesCounter.inc(); 
    res.sendStatus(200);
});

app.post('/api/add', async (req, res) => {
    try {
        const { sku, name, qty, idealStock, rating } = req.body;
        const newItem = new Item({ _id: Number(sku), name, qty, idealStock, rating });
        await newItem.save();
        
        await updatePrometheusMetrics(); // <--- במקום itemsGauge.set הישן
        res.sendStatus(201);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/delete/:id', async (req, res) => {
    await Item.deleteOne({ _id: Number(req.params.id) });
    
    stockGauge.reset(); // מאפס מדדים קודמים כדי שלא יהיו כפילויות
    await updatePrometheusMetrics(); // <--- מעדכן את הרשימה החדשה
    res.sendStatus(200);
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));