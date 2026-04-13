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

// Schema עם הגבלות (Validation) ברמת מסד הנתונים
const itemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Zא-ת\s]+$/.test(v); // רק אותיות ורווחים
            },
            message: props => `${props.value} אינו שם תקין! השתמש באותיות בלבד.`
        }
    },
    currentStock: { type: Number, min: 0 }, // מונע שלילי
    idealStock: { type: Number, min: 0 }
});
const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/', async (req, res) => {
    const items = await Item.find();
    let rows = items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 15px; display: flex; align-items: center; justify-content: space-between; width: 600px;">
            <div style="width: 150px;">
                <strong style="font-size: 1.1em;">${item.name}</strong>
            </div>
            <div style="color: #666; font-size: 0.9em;">
                יעד חנות: <span id="ideal-${item._id}">${item.idealStock}</span>*
            </div>
            <div>
                <button onclick="updateQty('${item._id}', -1)" style="padding: 5px 12px;">-</button>
                <span id="qty-${item._id}" style="margin: 0 15px; font-weight: bold; width: 30px; display: inline-block; text-align: center;">${item.currentStock}</span>
                <button onclick="updateQty('${item._id}', 1)" style="padding: 5px 12px;">+</button>
            </div>
            <button onclick="saveQty('${item._id}')" style="background: #28a745; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px;">שמור</button>
        </div>
    `).join('');

    res.send(`
        <html>
            <head>
                <title>Octopus Inventory Management</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; background: #f4f7f6; display: flex; flex-direction: column; align-items: center; padding: 40px; direction: rtl; }
                    .form-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; width: 600px; }
                    input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
                    .btn-add { background: #007bff; color: white; border: none; padding: 10px; cursor: pointer; width: 100%; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>ניהול מלאי חכם 🛒</h1>

                <div class="form-box">
                    <h3>➕ הוספת פריט חדש</h3>
                    <input type="text" id="newName" placeholder="שם הפריט (אותיות בלבד)" style="width: 96%;">
                    <input type="number" id="newCurrent" placeholder="כמות במלאי" style="width: 46%;">
                    <input type="number" id="newIdeal" placeholder="כמות יעד (אידיאלית)" style="width: 46%;">
                    <button class="btn-add" onclick="addNewItem()">הוסף למערכת</button>
                </div>

                <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    ${rows}
                </div>

                <script>
                    function updateQty(id, change) {
                        const el = document.getElementById('qty-' + id);
                        let val = parseInt(el.innerText) + change;
                        if (val >= 0) el.innerText = val;
                    }

                    async function saveQty(id) {
                        const current = parseInt(document.getElementById('qty-' + id).innerText);
                        const ideal = parseInt(document.getElementById('ideal-' + id).innerText);

                        if (current > ideal) {
                            alert('שים לב! חרגת מהכמות האידיאלית ב-' + (current - ideal) + ' יחידות.');
                        }

                        const response = await fetch('/api/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id, newQty: current })
                        });
                        if (response.ok) alert('המלאי עודכן!');
                    }

                    async function addNewItem() {
                        const name = document.getElementById('newName').value;
                        const current = parseInt(document.getElementById('newCurrent').value);
                        const ideal = parseInt(document.getElementById('newIdeal').value);

                        // בדיקת שם (רק אותיות עברית/אנגלית)
                        const nameRegex = /^[a-zA-Zא-ת\\s]+$/;
                        if (!nameRegex.test(name)) {
                            alert('שגיאה: שם הפריט חייב להכיל אותיות בלבד (ללא מספרים או תווים)!');
                            return;
                        }

                        if (current < 0 || ideal < 0) {
                            alert('שגיאה: הכמות לא יכולה להיות שלילית!');
                            return;
                        }

                        if (current > ideal) {
                            alert('שים לב: הוספת מוצר עם חריגה של ' + (current - ideal) + ' מהכמות האידיאלית.');
                        }

                        const response = await fetch('/api/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, currentStock: current, idealStock: ideal })
                        });

                        if (response.ok) {
                            alert('הפריט נוסף בהצלחה!');
                            window.location.reload();
                        } else {
                            const err = await response.json();
                            alert('שגיאה מהשרת: ' + err.message);
                        }
                    }
                </script>
            </body>
        </html>
    `);
});

// API: עדכון
app.post('/api/save', async (req, res) => {
    const { id, newQty } = req.body;
    await Item.findByIdAndUpdate(id, { currentStock: Math.max(0, newQty) });
    res.sendStatus(200);
});

// API: הוספה
app.post('/api/add', async (req, res) => {
    try {
        const { name, currentStock, idealStock } = req.body;
        const newItem = new Item({ name, currentStock, idealStock });
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