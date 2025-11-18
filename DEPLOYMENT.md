# N-Queen Visualiser - Deployment Guide

This guide explains how to deploy the N-Queen Visualiser application using Docker, Terraform, and Ansible.

## 📋 Prerequisites

### Required Tools
- **Docker** and **Docker Compose**
- **Terraform** (>= 1.0)
- **Ansible** (>= 2.9)
- **AWS CLI** (configured with credentials)
- **SSH Key Pair** (will be generated if not exists)

### AWS Requirements
- AWS Account with appropriate permissions
- AWS credentials configured (`aws configure`)
- Access to create EC2, VPC, Security Groups, etc.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  AWS Cloud                      │
│  ┌───────────────────────────────────────────┐  │
│  │  VPC (10.0.0.0/16)                        │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Public Subnet (10.0.1.0/24)        │  │  │
│  │  │  ┌───────────────────────────────┐  │  │  │
│  │  │  │   EC2 Instance (Ubuntu)       │  │  │  │
│  │  │  │   ┌─────────────────────────┐ │  │  │  │
│  │  │  │   │  Docker Container       │ │  │  │  │
│  │  │  │   │  - Nginx                │ │  │  │  │
│  │  │  │   │  - N-Queen App          │ │  │  │  │
│  │  │  │   └─────────────────────────┘ │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  Internet Gateway                         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
N-Queen-Visualiser/
├── project/                # Application source code
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── chess123.avif
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Main Terraform configuration
│   ├── variables.tf       # Variable definitions
│   └── outputs.tf         # Output values
├── ansible/               # Configuration Management
│   ├── deploy.yml         # Deployment playbook
│   ├── inventory.ini      # Server inventory
│   └── ansible.cfg        # Ansible configuration
├── Dockerfile             # Container definition
├── docker-compose.yml     # Local development setup
├── deploy.sh             # Automated deployment script
└── DEPLOYMENT.md         # This file
```

## 🚀 Deployment Options

### Option 1: Quick Deploy (Automated)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

Select from menu:
1. **Test locally with Docker** - Build and run locally
2. **Deploy to AWS EC2** - Deploy to cloud
3. **Full deployment** - Test locally then deploy
4. **Destroy infrastructure** - Clean up AWS resources

### Option 2: Manual Deployment

#### Step 1: Test Locally

```bash
# Build Docker image
docker build -t n-queen-visualiser .

# Run container
docker-compose up -d

# Access application
# Open browser: http://localhost:8080

# Stop containers
docker-compose down
```

#### Step 2: Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply infrastructure
terraform apply

# Get instance IP
terraform output instance_public_ip
```

#### Step 3: Update Ansible Inventory

Edit `ansible/inventory.ini`:
```ini
[webservers]
ec2-instance ansible_host=<YOUR_EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
```

#### Step 4: Deploy Application with Ansible

```bash
cd ansible

# Test connection
ansible webservers -m ping

# Deploy application
ansible-playbook deploy.yml
```

## 🔧 Configuration

### Terraform Variables

Edit `terraform/variables.tf` or create `terraform.tfvars`:

```hcl
aws_region      = "us-east-1"
project_name    = "n-queen-visualiser"
instance_type   = "t2.micro"
public_key_path = "~/.ssh/id_rsa.pub"
```

### Ansible Variables

Edit `ansible/deploy.yml` to customize:
- `app_port`: Application port (default: 8080)
- `docker_image_name`: Docker image name
- `project_dir`: Deployment directory on EC2

## 🔐 Security Notes

1. **SSH Keys**: Generated automatically if not exists
2. **Security Group**: Opens ports 22 (SSH), 80 (HTTP), 8080 (App)
3. **IAM**: Ensure AWS credentials have proper permissions
4. **Best Practice**: Restrict SSH access to your IP in production

## 📊 Monitoring and Access

After deployment:

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/id_rsa ubuntu@<EC2_PUBLIC_IP>

# Check Docker containers
docker ps

# View application logs
docker logs n-queen-visualiser

# Check application status
curl http://<EC2_PUBLIC_IP>:8080
```

## 🧪 Testing

### Local Testing
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

### Remote Testing
```bash
# Test connectivity
ansible webservers -m ping

# Check application
curl http://<EC2_PUBLIC_IP>:8080
```

## 🧹 Cleanup

### Destroy Infrastructure

```bash
# Using deployment script
./deploy.sh
# Select option 4

# Or manually
cd terraform
terraform destroy
```

### Stop Local Containers

```bash
docker-compose down
docker rmi n-queen-visualiser
```

## 🐛 Troubleshooting

### SSH Connection Issues
```bash
# Check security group allows SSH (port 22)
# Verify SSH key permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Docker Build Fails
```bash
# Check Dockerfile syntax
# Verify project files exist
# Check Docker daemon is running
docker info
```

### Ansible Connection Fails
```bash
# Wait for EC2 to be ready (30-60 seconds)
# Test SSH manually
ssh -i ~/.ssh/id_rsa ubuntu@<EC2_IP>

# Check inventory file
ansible-inventory --list
```

### Application Not Accessible
```bash
# Check Docker container
docker ps

# Check container logs
docker logs n-queen-visualiser

# Verify security group allows port 8080
# Check if nginx is running
curl http://localhost:8080 (from EC2 instance)
```

## 💡 Tips

1. **Cost Optimization**: Use `t2.micro` for free tier eligibility
2. **Regional Selection**: Choose AWS region closest to users
3. **Testing**: Always test locally before deploying
4. **Backups**: Version control all IaC files
5. **Monitoring**: Set up CloudWatch for production

## 📝 Notes

- Default instance type: `t2.micro` (AWS Free Tier eligible)
- Default region: `us-east-1`
- Application runs on port: `8080`
- Uses Ubuntu 22.04 LTS
- Nginx serves static files

## 🔗 Useful Commands

```bash
# Terraform
terraform fmt              # Format code
terraform validate         # Validate configuration
terraform show            # Show current state
terraform output          # Display outputs

# Ansible
ansible-playbook deploy.yml --check    # Dry run
ansible-playbook deploy.yml -v         # Verbose output
ansible webservers -m setup            # Gather facts

# Docker
docker build -t n-queen-visualiser .   # Build image
docker run -p 8080:80 n-queen-visualiser  # Run container
docker exec -it <container> sh         # Shell access
```

## 📞 Support

For issues or questions:
- Check logs: `docker logs n-queen-visualiser`
- Review Terraform state: `terraform show`
- Test Ansible connectivity: `ansible webservers -m ping`

---

**Happy Deploying! 🚀**
