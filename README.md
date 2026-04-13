# 🐙 Project Octopus - AWS Inventory Management System

## 🌐 Live Site Access
- **URL:** http://13.50.17.24/
- **Cloud Infrastructure:** AWS (EC2)
- **Architecture:** High Availability Microservices
- **Status:** Live & Monitored

## 📝 Project Overview

Octopus is an advanced inventory management platform. This project demonstrates a comprehensive cloud architecture featuring service distribution, load balancing, and continuous monitoring. It enables businesses to manage items, quantities, and updates in real-time within a secure and resilient environment.

## ☁️ AWS Infrastructure

The project is built on AWS cloud infrastructure and managed using Infrastructure as Code (IaC) principles:

- **EC2 (Elastic Compute Cloud):** A t3.micro virtual server running all containers in a Docker environment.
- **VPC & Networking:** An isolated network ensuring that communication between the application and the database remains internal and secure.
- **Security Groups:** Firewall configuration allowing external access only through essential ports:
  - Port 80: Public web access
  - Port 22: SSH management access
  - Port 3000: Grafana monitoring dashboard access
- **Terraform:** All resources were automatically provisioned using Terraform scripts, allowing for entire infrastructure recreation with a single command.

## 🔄 CI/CD Process (Automation Pipeline)

The project implements a Continuous Integration & Continuous Deployment pipeline for full automation:

1. **Code Push:** Pushing code to GitHub triggers the automated workflow
2. **GitHub Actions:** Automated testing and building of the Docker Image
3. **Docker Hub:** Deployment of the updated image to a central repository
4. **Auto-Deploy:** SSH connection to the EC2 server, pulling the latest image, and refreshing services with zero downtime

## 🏗️ System Architecture

The system is built with a layered architecture to ensure stability and efficiency:

```
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
```

### Architecture Layers

- **Traffic Layer:** Nginx server acting as a Reverse Proxy and Load Balancer
- **Logic Layer:** 3 Node.js replicas for maximum redundancy
- **Data Layer:** MongoDB utilizing Docker Volumes for data persistence
- **Monitoring Layer:** Prometheus and Grafana for performance tracking

## 🛡️ Resilience & Data Persistence

### What happens if a container fails?
The system is designed for High Availability: Nginx detects failures and reroutes traffic to healthy replicas immediately (Zero Downtime). Thanks to the `restart: always` policy, the failed container is automatically redeployed within 2-5 seconds.

### Is data saved after a crash?
Yes. All data is stored in Docker Volumes mapped to the EC2 physical disk. This ensures no data loss even if the database container is replaced or the server restarts.

## 🛠️ Technical Specifications

| Component | Technology | Ports | Role |
|-----------|------------|-------|------|
| Nginx | Reverse Proxy | 80:80 | Request Routing & Load Balancing |
| App | Node.js Express | 3000 (Int) | Inventory Logic & Metrics Exposure |
| Database | MongoDB | 27017 (Int) | Persistent Data Storage |
| Monitoring | Prometheus | 9090 (Int) | Metrics Collection |
| Visual | Grafana | 3000:3000 (Ext) | Visual Dashboards |

## 🔑 Master Credentials

- **Username:** octopus
- **Password:** octopus
- **Valid for:** Grafana, MongoDB, and Application Admin

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/danielryazanov/octopus-app-dev.git

# Navigate to the project directory
cd octopus-app-dev

# Spin up the infrastructure
sudo docker-compose up -d
```

## 📚 Documentation

- For detailed installation instructions, see [INSTALL.md](INSTALL.md)
- For troubleshooting, see [Monitoring and Troubleshooting](#monitoring-and-troubleshooting) section

## 🔍 Monitoring and Troubleshooting

- Use Grafana dashboards to monitor system health (accessible at http://13.50.17.24:3000)
- Prometheus alerts notify the team of potential issues before they escalate
- Check container logs for debugging: `docker-compose logs [service-name]`

## 📁 Project Structure

```
/octopus-app-dev
  ├── /services
  │   ├── /web
  │   └── /api
  ├── /docker
  ├── /terraform
  ├── /docs
  ├── docker-compose.yml
  └── README.md
```

---

🤖 AI Assistance

The development and research phases of this project were supported by advanced AI tools:

NotebookLM / Gemini: Utilized for technical research, information gathering, and system documentation.

Claude (for VS Code): Utilized for logic optimization, and debugging.
