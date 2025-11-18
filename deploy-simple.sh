#!/bin/bash

# Simple AWS EC2 Deployment Script (No Terraform Required)
# This script uses AWS CLI directly - much faster!

set -e

echo "=================================="
echo "Simple EC2 Deployment Script"
echo "=================================="

# Configuration
REGION="us-east-1"
INSTANCE_TYPE="t2.micro"
AMI_ID="ami-0c55b159cbfafe1f0"  # Ubuntu 22.04 in us-east-1
KEY_NAME="n-queen-key"
SECURITY_GROUP_NAME="n-queen-sg"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}[1/6] Checking AWS CLI...${NC}"
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Please install it first."
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

echo -e "${YELLOW}[2/6] Creating key pair...${NC}"
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION &> /dev/null; then
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --region $REGION \
        --query 'KeyMaterial' \
        --output text > ~/.ssh/${KEY_NAME}.pem
    chmod 400 ~/.ssh/${KEY_NAME}.pem
    echo -e "${GREEN}✓ Key pair created${NC}"
else
    echo -e "${GREEN}✓ Key pair already exists${NC}"
fi

echo -e "${YELLOW}[3/6] Creating security group...${NC}"
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" \
    --region $REGION \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || echo "None")

if [ "$SG_ID" = "None" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for N-Queen Visualiser" \
        --region $REGION \
        --query 'GroupId' \
        --output text)
    
    # Add rules
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp --port 22 --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp --port 80 --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp --port 8080 --cidr 0.0.0.0/0 \
        --region $REGION
    
    echo -e "${GREEN}✓ Security group created: $SG_ID${NC}"
else
    echo -e "${GREEN}✓ Security group already exists: $SG_ID${NC}"
fi

echo -e "${YELLOW}[4/6] Creating user data script...${NC}"
cat > /tmp/user-data.sh << 'USERDATA'
#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose git
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu
USERDATA

echo -e "${YELLOW}[5/6] Launching EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --region $REGION \
    --user-data file:///tmp/user-data.sh \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=n-queen-visualiser}]' \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}✓ Instance launched: $INSTANCE_ID${NC}"

echo -e "${YELLOW}[6/6] Waiting for instance to be running...${NC}"
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo ""
echo "=================================="
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "=================================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "SSH Command: ssh -i ~/.ssh/${KEY_NAME}.pem ubuntu@$PUBLIC_IP"
echo ""
echo "Wait 2-3 minutes for instance to fully initialize, then run:"
echo "  cd ansible"
echo "  # Update inventory.ini with IP: $PUBLIC_IP"
echo "  ansible-playbook deploy.yml"
echo ""

# Save info
cat > /tmp/ec2-info.txt << EOF
Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Security Group: $SG_ID
Key: ~/.ssh/${KEY_NAME}.pem
EOF

echo "Instance info saved to: /tmp/ec2-info.txt"
