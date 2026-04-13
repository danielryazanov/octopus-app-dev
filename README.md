<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Octopus AWS Cloud Architecture & CI/CD Pipeline</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Assistant:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #020617;
            --panel-bg: rgba(30, 41, 59, 0.7);
            --accent-blue: #38bdf8;
            --accent-green: #10b981;
            --accent-orange: #f59e0b;
            --accent-red: #ef4444;
        }
        body { 
            background-color: var(--bg-dark); 
            color: #f8fafc; 
            font-family: 'Assistant', 'Inter', sans-serif;
            overflow-x: hidden;
        }
        .glass-panel {
            background: var(--panel-bg);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }
        .component-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent-blue);
            transition: all 0.3s ease;
        }
        .flow-line {
            stroke-dasharray: 5;
            animation: dash 5s linear infinite;
        }
        @keyframes dash {
            to { stroke-dashoffset: -50; }
        }
        .port-label {
            font-size: 10px;
            fill: #94a3b8;
            font-family: monospace;
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <!-- Live Site Access -->
    <div class="max-w-7xl mx-auto mb-8">
        <div class="glass-panel p-4 border-sky-500/50 flex flex-col md:flex-row items-center justify-between bg-sky-500/10">
            <div class="flex items-center mb-4 md:mb-0">
                <span class="relative flex h-3 w-3 ml-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                <h2 class="text-xl font-bold">Live Site Access:</h2>
            </div>
            <a href="http://13.50.17.24/" target="_blank" class="text-2xl font-mono text-sky-400 hover:text-sky-300 underline underline-offset-8 decoration-sky-500/30">
                http://13.50.17.24/
            </a>
            <div class="hidden md:block px-4 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-400 border border-slate-700">
                Region: eu-north-1 (Stockholm)
            </div>
        </div>
    </div>

    <header class="max-w-6xl mx-auto mb-10 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Cloud Infrastructure Diagram
        </h1>
        <p class="text-slate-400 text-lg">AWS EC2 Deployment | GitHub Actions CI/CD | 2-Repo Strategy</p>
    </header>

    <main class="max-w-7xl mx-auto space-y-8">
        
        <!-- Project Meaning Section -->
        <div class="glass-panel p-6 border-sky-500/20">
            <h2 class="text-2xl font-bold mb-4 text-sky-400">מהות הפרויקט: ניהול מלאי חכם</h2>
            <p class="text-slate-300 leading-relaxed">
                מערכת <b>Octopus</b> היא פלטפורמת ניהול מלאי (Inventory Management) מקצה לקצה. המערכת מאפשרת לעסקים לעקוב אחר מוצרים, כמויות ושינויים במלאי בזמן אמת. 
                המשמעות הטכנית היא שכל עדכון מלאי עובר תהליך אימות, נשמר בבסיס נתונים מבוזר, ומנוטר באופן רציף כדי להבטיח שהנתונים העסקיים תמיד מדויקים וזמינים למנהלי המחסן.
            </p>
        </div>

        <!-- 2-Repo Strategy Section (NEW) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 border-sky-500/30">
                <h3 class="text-xl font-bold text-sky-400 mb-4 flex items-center">
                    <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    1. Infrastructure Repository (octopus-infra)
                </h3>
                <p class="text-sm text-slate-300">
                    מאגר זה אחראי על <b>התשתית</b>. הוא מכיל את הגדרות ה-Terraform להקמת השרת ב-AWS, את קובץ ה-Docker Compose, הגדרות ה-Nginx, וקונפיגורציית הניטור (Prometheus & Grafana). הפרדה זו מבטיחה שינויי תשתית מבוקרים שאינם תלויים בקוד האפליקציה.
                </p>
            </div>
            <div class="glass-panel p-6 border-emerald-500/30">
                <h3 class="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                    <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    2. Development Repository (octopus-app)
                </h3>
                <p class="text-sm text-slate-300">
                    מאגר זה מכיל את <b>קוד המקור</b> של האפליקציה (Node.js). הוא כולל את הלוגיקה העסקית, ה-Unit Tests, וה-Dockerfile לבניית האימג'. המפתחים עובדים כאן באופן שוטף, וכל Push מפעיל את תהליך ה-Build האוטומטי.
                </p>
            </div>
        </div>

        <!-- CI/CD Process Section (NEW) -->
        <div class="glass-panel p-6 border-purple-500/30 bg-purple-500/5">
            <h2 class="text-2xl font-bold mb-6 text-purple-400 flex items-center">
                <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                תהליך ה-CI/CD עם GitHub Actions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <span class="text-purple-400 font-bold block mb-2">1. Push</span>
                    <p class="text-xs text-slate-400">מתכנת דוחף קוד ל-App Repo</p>
                </div>
                <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <span class="text-purple-400 font-bold block mb-2">2. CI Build</span>
                    <p class="text-xs text-slate-400">בדיקות יחידה ובניית Docker Image</p>
                </div>
                <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <span class="text-purple-400 font-bold block mb-2">3. Registry</span>
                    <p class="text-xs text-slate-400">דחיפת האימג' ל-Docker Hub</p>
                </div>
                <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <span class="text-purple-400 font-bold block mb-2">4. CD Deploy</span>
                    <p class="text-xs text-slate-400">עדכון השרת ב-AWS אוטומטית</p>
                </div>
            </div>
            <p class="mt-6 text-sm text-slate-400 leading-relaxed italic">
                <b>כיצד זה עובד?</b> בתוך ה-GitHub Actions הגדרנו Pipeline שמתחבר ב-SSH לשרת ה-EC2, מבצע <code class="bg-slate-800 px-1 rounded">docker compose pull</code> ומרענן את הקונטיינרים. זה מאפשר לנו לשחרר גרסאות חדשות בלחיצת כפתור אחת.
            </p>
        </div>

        <!-- Detailed SVG Diagram -->
        <div class="glass-panel p-8">
            <h2 class="text-2xl font-bold mb-6 flex items-center text-sky-400">
                <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                Detailed AWS Topology
            </h2>
            <div class="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <svg viewBox="0 0 800 450" class="w-full h-auto">
                    <!-- AWS Cloud Boundary -->
                    <rect x="10" y="10" width="780" height="430" rx="15" fill="none" stroke="#64748b" stroke-dasharray="8,4" stroke-width="1" />
                    <text x="25" y="30" fill="#64748b" font-size="12" font-weight="bold">AWS Cloud</text>

                    <!-- VPC Boundary -->
                    <rect x="120" y="40" width="650" height="380" rx="10" fill="rgba(56, 189, 248, 0.03)" stroke="#38bdf8" stroke-width="1" />
                    <text x="135" y="60" fill="#38bdf8" font-size="10">VPC (10.0.0.0/16)</text>

                    <!-- Public Subnet / EC2 -->
                    <rect x="140" y="70" width="610" height="330" rx="8" fill="rgba(30, 41, 59, 0.5)" stroke="#fbbf24" stroke-width="2" />
                    <text x="155" y="90" fill="#fbbf24" font-size="10" font-weight="bold">EC2 Instance (t3.micro) - 13.50.17.24</text>

                    <!-- Internet to EC2 -->
                    <circle cx="50" cy="225" r="20" fill="#334155" />
                    <text x="50" y="230" fill="white" font-size="8" text-anchor="middle">Users</text>
                    <path d="M 70 225 L 140 225" class="flow-line" stroke="#38bdf8" stroke-width="2" fill="none" />
                    <text x="105" y="215" class="port-label" text-anchor="middle">Port 80</text>

                    <!-- Docker Network -->
                    <rect x="180" y="110" width="550" height="270" rx="8" fill="none" stroke="#94a3b8" stroke-dasharray="4" />
                    <text x="195" y="130" fill="#94a3b8" font-size="9">Docker Internal Bridge Network</text>

                    <!-- Nginx Container -->
                    <rect x="200" y="160" width="80" height="130" rx="6" fill="#1e293b" stroke="#fbbf24" />
                    <text x="240" y="215" fill="white" font-size="11" font-weight="bold" text-anchor="middle">Nginx</text>
                    <text x="240" y="230" fill="#fbbf24" font-size="8" text-anchor="middle">P: 80:80</text>

                    <!-- App Cluster -->
                    <rect x="330" y="140" width="140" height="180" rx="6" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" />
                    <rect x="345" y="155" width="110" height="30" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
                    <rect x="345" y="205" width="110" height="30" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
                    <rect x="345" y="255" width="110" height="30" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
                    <text x="400" y="310" fill="#38bdf8" font-size="9" text-anchor="middle">App Replicas (P:3000)</text>

                    <!-- Database Container -->
                    <rect x="520" y="160" width="80" height="60" rx="6" fill="#1e293b" stroke="#10b981" />
                    <text x="560" y="190" fill="white" font-size="11" font-weight="bold" text-anchor="middle">Mongo</text>
                    <text x="560" y="205" fill="#10b981" font-size="8" text-anchor="middle">P: 27017</text>

                    <!-- Monitoring -->
                    <rect x="520" y="250" width="80" height="50" rx="6" fill="#1e293b" stroke="#ef4444" />
                    <text x="560" y="280" fill="white" font-size="10" text-anchor="middle">Prometheus</text>
                    
                    <rect x="630" y="250" width="80" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" />
                    <text x="670" y="280" fill="white" font-size="10" text-anchor="middle">Grafana</text>
                    <text x="670" y="315" fill="#f59e0b" font-size="8" text-anchor="middle">Port 3000 (Pub)</text>

                    <!-- Connectors -->
                    <path d="M 280 225 L 330 225" stroke="#94a3b8" stroke-width="1" fill="none" marker-end="url(#arrowhead)" />
                    <path d="M 470 190 L 520 190" stroke="#10b981" stroke-width="1" fill="none" marker-end="url(#arrowhead)" />
                    <path d="M 470 275 L 520 275" stroke="#ef4444" stroke-width="1" fill="none" stroke-dasharray="2,2" />
                    <path d="M 600 275 L 630 275" stroke="#f59e0b" stroke-width="1" fill="none" />
                    
                    <!-- Arrow Marker Defs -->
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                </svg>
            </div>
        </div>

        <!-- Resilience & Persistence Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 border-emerald-500/30">
                <h3 class="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                    <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    שרידות וחוסן (High Availability)
                </h3>
                <div class="space-y-4 text-sm text-slate-300">
                    <p><b>מה קורה אם קונטיינר קורס?</b> המערכת בנויה בשיטת Self-Healing. אם רפליקה אחת של האפליקציה נופלת, ה-Nginx יזהה זאת מיד ויפסיק להעביר אליה תנועה, כך שהמשתמש כלל לא ירגיש בתקלה (Zero Downtime).</p>
                    <p><b>זמן התאוששות:</b> בזכות ה-Restart Policy של Docker Compose, הקונטיינר יורם מחדש <b>תוך שניות בודדות</b> באופן אוטומטי.</p>
                </div>
            </div>
            <div class="glass-panel p-6 border-sky-500/30">
                <h3 class="text-xl font-bold text-sky-400 mb-4 flex items-center">
                    <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    שימור נתונים (Persistence)
                </h3>
                <div class="space-y-4 text-sm text-slate-300">
                    <p><b>איפה נשמר המידע?</b> המידע נשמר בתוך <b>Docker Volumes</b> המקושרים לדיסק הפיזי של שרת ה-EC2 ב-AWS.</p>
                    <p><b>האם המידע נשמר לאחר קריסה?</b> כן! גם אם הקונטיינר של MongoDB נמחק ונוצר מחדש, הוא מתחבר לאותה תיקיית נתונים חיצונית (`mongodb_data`). כל המלאי, המוצרים וההגדרות נשמרים ללא אובדן מידע.</p>
                </div>
            </div>
        </div>

        <!-- Component Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Nginx Card -->
            <div class="glass-panel p-6 component-card border-amber-500/30">
                <h3 class="text-lg font-bold text-amber-400 mb-4 flex items-center">
                    Nginx Reverse Proxy
                </h3>
                <div class="text-xs space-y-2">
                    <p class="font-bold text-slate-300">תפקיד:</p>
                    <p class="text-slate-400">ניתוב תנועה ו-Load Balancing. הפורט היחיד שחשוף לאינטרנט (80).</p>
                </div>
            </div>

            <!-- App Card -->
            <div class="glass-panel p-6 component-card border-sky-500/30">
                <h3 class="text-lg font-bold text-sky-400 mb-4 flex items-center">
                    Node.js Cluster
                </h3>
                <div class="text-xs space-y-2">
                    <p class="font-bold text-slate-300">תפקיד:</p>
                    <p class="text-slate-400">לוגיקה עסקית של ניהול המלאי. 3 מופעים לשרידות מקסימלית.</p>
                </div>
            </div>

            <!-- DB Card -->
            <div class="glass-panel p-6 component-card border-emerald-500/30">
                <h3 class="text-lg font-bold text-emerald-400 mb-4 flex items-center">
                    Mongo Database
                </h3>
                <div class="text-xs space-y-2">
                    <p class="font-bold text-slate-300">תפקיד:</p>
                    <p class="text-slate-400">אחסון פרסיסטנטי של המלאי. נשמר ב-Volumes כדי לשרוד קריסות.</p>
                </div>
            </div>

            <!-- Monitoring Card -->
            <div class="glass-panel p-6 component-card border-orange-500/30">
                <h3 class="text-lg font-bold text-orange-400 mb-4 flex items-center">
                    Monitoring Stack
                </h3>
                <div class="text-xs space-y-2">
                    <p class="font-bold text-slate-300">תפקיד:</p>
                    <p class="text-slate-400">איסוף מדדים (Prometheus) ותצוגה ויזואלית (Grafana).</p>
                </div>
            </div>
        </div>

        <!-- Credentials Footer Section -->
        <div class="glass-panel p-6 border-emerald-500/50 bg-emerald-500/5">
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="flex items-center mb-4 md:mb-0">
                    <div class="p-3 bg-emerald-500/20 rounded-xl ml-4">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-emerald-400 uppercase tracking-widest">Master Credentials</h2>
                        <p class="text-xs text-slate-500">תקף לכל רכיבי המערכת (Grafana, DB, Auth)</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="bg-slate-900 px-6 py-3 rounded-lg border border-slate-700 flex flex-col">
                        <span class="text-[10px] text-slate-500">USER</span>
                        <span class="font-mono text-xl text-emerald-400">octopus</span>
                    </div>
                    <div class="bg-slate-900 px-6 py-3 rounded-lg border border-slate-700 flex flex-col">
                        <span class="text-[10px] text-slate-500">PASSWORD</span>
                        <span class="font-mono text-xl text-emerald-400">octopus</span>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <footer class="max-w-7xl mx-auto mt-12 text-center text-slate-500 text-sm">
        <p>© 2026 Octopus Infrastructure Project | Architecture Documentation v2.3</p>
    </footer>

</body>
</html>
