📋 Project Overview
Project Octopus is an advanced inventory management system deployed on AWS with a modern microservices architecture.

🔑 Key Components:
Cloud Infrastructure (AWS)

EC2 t3.micro instance running Docker containers
VPC with isolated networking
Security groups controlling access (ports 80, 22, 3000)
Infrastructure managed via Terraform (IaC)
Architecture (High Availability)

Load Balancer: Nginx (reverse proxy, round-robin distribution)
Application Layer: 3 Node.js Express replicas for redundancy
Database Layer: MongoDB with Docker Volumes for data persistence
Monitoring: Prometheus + Grafana for metrics and visualization
CI/CD Pipeline (Automation)

Code push → GitHub Actions → Docker build → Docker Hub → Auto-deploy to EC2 via SSH
Zero-downtime deployments
Resilience Features

Auto-restart of failed containers
Load balancer detects failures and reroutes traffic
Data persistence via Docker Volumes
Horizontal scaling with 3 replicas
🔐 Access Credentials:
Username: octopus
Password: octopus
Live site: http://13.50.17.24/
📊 Technical Stack:
Component	Technology	Port	Role
Load Balancer	Nginx	80	Traffic routing & balancing
Application	Node.js Express	3000	Business logic
Database	MongoDB	27017	Data persistence
Metrics	Prometheus	9090	Performance data collection
Dashboard	Grafana	3000	Visualization
