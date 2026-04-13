const express = require('express');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://octopus_user:YJpn6ZTdPdIbNBXq@danielmongo.3yle095.mongodb.net/test?retryWrites=true&w=majority&appName=danielMongo';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema מעודכן - המק"ט הוא ה-ID
const itemSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // המק"ט (SKU)
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

// פונקציית עזר להצגת כוכבים
function getStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += '⭐';
        else if (rating >= i - 0.5) html += '🌗';
        else html += '☆';
    }
    return html;
}

app.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        let rows = items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 15px; display: flex; align-items: center; justify-content: space-between; width: 750px; background: white; margin-bottom: 5px; border-radius: 8px;">
                <div style="width: 100px; color: #888; font-size: 0.8em;">מק"ט: ${item._id}</div>
                <div style="width: 120px;"><strong>${item.name}</strong></div>
                <div style="width: 120px; color: #f39c12;">${getStarsHTML(item.rating)} (${item.rating})</div>
                <div style="color: #666; font-size: 0.85em;">יעד: <span id="ideal-${item._id}">${item.idealStock}</span>*</div>
                <div style="display: flex; align-items: center;">
                    <button onclick="updateQty('${item._id}', -1)" style="padding: 5px 10px;">-</button>
                    <span id="qty-${item._id}" style="margin: 0 10px; font-weight: bold; width: 25px; text-align: center;">${item.qty}</span>
                    <button onclick="updateQty('${item._id}', 1)" style="padding: 5px 10px;">+</button>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="saveQty('${item._id}')" style="background: #28a745; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">שמור</button>
                    <button onclick="deleteItem('${item._id}')" style="background: #dc3545; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">מחק</button>
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
                        <input type="text" id="newSku" placeholder="מק"ט (ID ייחודי)" style="width: 20%;">
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
                        alert('עודכן!');
                    }

                    async function deleteItem(id) {
                        if (confirm('למחוק?')) {
                            await fetch('/api/delete/' + id, { method: 'DELETE' });
                            location.reload();
                        }
                    }

                    async function addNewItem() {
                        const sku = document.getElementById('newSku').value;
                        const name = document.getElementById('newName').value;
                        const rating = parseFloat(document.getElementById('newRating').value);
                        const current = parseInt(document.getElementById('newCurrent').value);
                        const ideal = parseInt(document.getElementById('newIdeal').value);

                        if (!sku || !name || /[0-9]/.test(name)) return alert('בדוק מק"ט ושם (אותיות בלבד)');
                        if (current < 0 || ideal < 0) return alert('אין להזין מספרים שליליים');

                        const response = await fetch('/api/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sku, name, qty: current, idealStock: ideal, rating })
                        });
                        if (response.ok) location.reload();
                        else alert('שגיאה: ייתכן והמק"ט כבר קיים');
                    }
                </script>
            </body>
            </html>
        `);
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/api/save', async (req, res) => {
    const { id, newQty } = req.body;
    await Item.updateOne({ _id: id }, { $set: { qty: Math.max(0, newQty) } });
    res.sendStatus(200);
});

app.post('/api/add', async (req, res) => {
    try {
        const { sku, name, qty, idealStock, rating } = req.body;
        const newItem = new Item({ _id: sku, name, qty, idealStock, rating });
        await newItem.save();
        res.sendStatus(201);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/delete/:id', async (req, res) => {
    await Item.deleteOne({ _id: req.params.id });
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));