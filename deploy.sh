#!/bin/bash

# N-Queen Visualiser Deployment Script
# This script automates the complete deployment process

set -e

echo "======================================"
echo "N-Queen Visualiser Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SSH key exists
check_ssh_key() {
    if [ ! -f ~/.ssh/id_rsa ]; then
        print_warning "SSH key not found. Generating new SSH key pair..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        print_info "SSH key generated successfully"
    else
        print_info "SSH key already exists"
    fi
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_info "Deploying infrastructure with Terraform..."
    cd terraform
    
    terraform init
    terraform plan -out=tfplan
    terraform apply tfplan
    
    # Get outputs
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    
    print_info "Infrastructure deployed successfully!"
    print_info "Instance IP: $INSTANCE_IP"
    
    cd ..
    
    # Update Ansible inventory
    print_info "Updating Ansible inventory..."
    cat > ansible/inventory.ini <<EOF
[webservers]
ec2-instance ansible_host=$INSTANCE_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
EOF
}

# Deploy application with Ansible
deploy_application() {
    print_info "Waiting 30 seconds for EC2 instance to be ready..."
    sleep 30
    
    print_info "Deploying application with Ansible..."
    cd ansible
    
    # Wait for SSH to be available
    print_info "Waiting for SSH connection..."
    INSTANCE_IP=$(cd ../terraform && terraform output -raw instance_public_ip && cd ../ansible)
    
    for i in {1..10}; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP "echo 'SSH is ready'" 2>/dev/null; then
            print_info "SSH connection established"
            break
        fi
        print_warning "Attempt $i: SSH not ready yet, waiting..."
        sleep 10
    done
    
    ansible-playbook deploy.yml
    
    print_info "Application deployed successfully!"
    cd ..
}

# Test local Docker build
test_local() {
    print_info "Testing Docker build locally..."
    docker-compose build
    docker-compose up -d
    
    print_info "Application running locally at http://localhost:8080"
    print_warning "Press Ctrl+C to stop local containers and continue with deployment"
    
    docker-compose logs -f
}

# Main menu
main() {
    echo "Select deployment option:"
    echo "1) Test locally with Docker"
    echo "2) Deploy to AWS EC2"
    echo "3) Full deployment (Test + Deploy)"
    echo "4) Destroy infrastructure"
    read -p "Enter option (1-4): " option
    
    case $option in
        1)
            test_local
            ;;
        2)
            check_ssh_key
            deploy_infrastructure
            deploy_application
            
            INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip)
            APP_URL=$(cd terraform && terraform output -raw application_url)
            
            echo ""
            print_info "=========================================="
            print_info "Deployment Complete!"
            print_info "=========================================="
            print_info "Application URL: $APP_URL"
            print_info "SSH Command: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP"
            print_info "=========================================="
            ;;
        3)
            print_info "Starting full deployment process..."
            test_local
            docker-compose down
            check_ssh_key
            deploy_infrastructure
            deploy_application
            
            INSTANCE_IP=$(cd terraform && terraform output -raw instance_public_ip)
            APP_URL=$(cd terraform && terraform output -raw application_url)
            
            echo ""
            print_info "=========================================="
            print_info "Full Deployment Complete!"
            print_info "=========================================="
            print_info "Application URL: $APP_URL"
            print_info "SSH Command: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP"
            print_info "=========================================="
            ;;
        4)
            print_warning "Destroying infrastructure..."
            cd terraform
            terraform destroy -auto-approve
            cd ..
            print_info "Infrastructure destroyed successfully!"
            ;;
        *)
            print_error "Invalid option selected"
            exit 1
            ;;
    esac
}

main
