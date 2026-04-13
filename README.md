🐙 Project Octopus - AWS Inventory Management System

🌐 כניסה לאתר החי: http://13.50.17.24/

Cloud Infrastructure: AWS (EC2) | Architecture: High Availability Microservices | Status: Live & Monitored

📝 אודות הפרויקט

מערכת Octopus היא פלטפורמת ניהול מלאי (Inventory Management) מתקדמת. הפרויקט מדגים ארכיטקטורת ענן מלאה הכוללת הפצה של שירותים, ניהול עומסים וניטור רציף. המערכת מאפשרת לעסקים לנהל פריטים, כמויות ועדכונים בזמן אמת בצורה מאובטחת ושרידה.

☁️ תשתית ענן (AWS Infrastructure)

הפרויקט מבוסס על תשתית הענן של AWS ומנוהל באמצעות Infrastructure as Code (IaC):

EC2 (Elastic Compute Cloud): שרת וירטואלי מסוג t3.micro המריץ את כל הקונטיינרים בסביבת Docker.

VPC & Networking: רשת מבודדת המבטיחה שתקשורת בין האפליקציה למסד הנתונים תהיה פנימית ומאובטחת.

Security Groups: הגדרת חומת אש (Firewall) המאפשרת גישה חיצונית אך ורק בפורטים נחוצים (80, 22, 3000).

Terraform: כל המשאבים הוקמו אוטומטית באמצעות סקריפטים של Terraform, מה שמאפשר להקים את כל התשתית מחדש בלחיצת כפתור.

🔄 תהליך CI/CD (Automation Pipeline)

הפרויקט מיישם תהליך של Continuous Integration & Continuous Deployment לאוטומציה מלאה:

Code Push: דחיפת קוד ל-GitHub מפעילה את ה-Workflow.

GitHub Actions: הרצת בדיקות אוטומטיות ובניית Docker Image.

Docker Hub: שליחת האימג' המעודכן למאגר המרכזי.

Auto-Deploy: התחברות ב-SSH לשרת ה-EC2, משיכת האימג' המעודכן וריענון השירותים ללא השבתה.

🏗️ מבנה וארכיטקטורת המערכת (System Architecture)

המערכת בנויה במבנה שכבות המבטיח שרידות ויעילות:

graph TD
    User((Users)) -->|Port 80| Nginx[Nginx Load Balancer]
    
    subgraph "AWS EC2 Cluster"
        Nginx -->|Round Robin| App1[App Replica 1]
        Nginx -->|Round Robin| App2[App Replica 2]
        Nginx -->|Round Robin| App3[App Replica 3]
        
        App1 & App2 & App3 -->|Persistence| Mongo[(MongoDB)]
        
        subgraph "Monitoring Layer"
            Prom[Prometheus] -->|Metrics| App1 & App2 & App3
            Grafana[Grafana] -->|Visualize| Prom
        end
    end
    
    classDef blue fill:#38bdf8,stroke:#0369a1,color:#fff
    classDef green fill:#10b981,stroke:#047857,color:#fff
    classDef orange fill:#f59e0b,stroke:#b45309,color:#fff
    classDef red fill:#ef4444,stroke:#b91c1c,color:#fff
    
    class App1,App2,App3 blue
    class Mongo green
    class Grafana orange
    class Prom red


שכבת התעבורה: שרת Nginx כ-Reverse Proxy ו-Load Balancer.

שכבת הלוגיקה: 3 רפליקות Node.js לשרידות מקסימלית.

שכבת הנתונים: MongoDB עם Docker Volumes לשימור מידע.

שכבת הניטור: Prometheus ו-Grafana למעקב ביצועים.

🛡️ חוסן, שרידות ושימור נתונים (Resilience)

מה קורה אם קונטיינר אחד קורס?

המערכת מתוכננת ל-High Availability: ה-Nginx יזהה את הקריסה ויפנה את התנועה לרפליקות התקינות (Zero Downtime). בזכות ה-restart: always, הקונטיינר יורם מחדש אוטומטית תוך 2-5 שניות.

האם המידע נשמר לאחר קריסה?

כן. כל הנתונים נשמרים ב-Docker Volumes הממופים לדיסק הפיזי של ה-EC2, כך שהמידע אינו אובד גם אם הקונטיינר של מסד הנתונים מוחלף.

🛠️ פירוט טכני של רכיבי המערכת

רכיב

טכנולוגיה

פורטים

תפקיד

Nginx

Reverse Proxy

80:80

ניתוב בקשות ו-Load Balancing

App

Node.js Express

3000 (Int)

לוגיקת המלאי וחשיפת מטריקות

Database

MongoDB

27017 (Int)

אחסון נתונים פרסיסטנטי

Monitoring

Prometheus

9090 (Int)

איסוף מדדי ביצועים (Metrics)

Visual

Grafana

3000:3000 (Ext)

דאשבורדים ויזואליים

🔑 פרטי גישה (Master Credentials)

Username: octopus

Password: octopus

(תקף עבור: Grafana, MongoDB והאפליקציה)

🚀 הרצה מהירה

# שכפול הפרויקט
git clone [https://github.com/danielryazanov/octopus-app-dev.git](https://github.com/danielryazanov/octopus-app-dev.git)

# הרצת התשתית
sudo docker-compose up -d
