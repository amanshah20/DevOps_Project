# Terraform Infrastructure

This directory contains Terraform configuration for deploying the N-Queen Visualiser to AWS EC2.

## 📁 Files

- `main.tf` - Main infrastructure configuration
- `variables.tf` - Variable definitions
- `outputs.tf` - Output values after deployment

## 🏗️ Resources Created

1. **VPC** (10.0.0.0/16)
   - Internet Gateway
   - Public Subnet (10.0.1.0/24)
   - Route Table

2. **Security Group**
   - Port 22: SSH access
   - Port 80: HTTP access
   - Port 8080: Application access

3. **EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier eligible)
   - Docker pre-installed

4. **SSH Key Pair**
   - Uses your local SSH key

## 🚀 Usage

### Initialize Terraform
```bash
terraform init
```

### Preview Changes
```bash
terraform plan
```

### Deploy Infrastructure
```bash
terraform apply
```

### Get Outputs
```bash
terraform output
terraform output -raw instance_public_ip
```

### Destroy Infrastructure
```bash
terraform destroy
```

## ⚙️ Configuration

### Default Variables

| Variable | Default | Description |
|----------|---------|-------------|
| aws_region | us-east-1 | AWS region |
| project_name | n-queen-visualiser | Project name |
| instance_type | t2.micro | EC2 instance type |
| public_key_path | ~/.ssh/id_rsa.pub | SSH public key path |

### Custom Configuration

Create `terraform.tfvars`:
```hcl
aws_region      = "us-west-2"
instance_type   = "t2.small"
public_key_path = "/path/to/your/key.pub"
```

## 📊 Outputs

After deployment, you'll get:

- `instance_id` - EC2 instance ID
- `instance_public_ip` - Public IP address
- `instance_public_dns` - Public DNS name
- `application_url` - Direct URL to access the app
- `ssh_command` - Command to SSH into the instance

## 💰 Cost Optimization

### Free Tier
- t2.micro: 750 hours/month (free)
- 30GB storage (free)
- 15GB data transfer out (free)

### Paid Instances
| Instance Type | vCPUs | Memory | Cost/hour (approx) |
|---------------|-------|--------|--------------------|
| t2.micro | 1 | 1GB | $0.0116 |
| t2.small | 1 | 2GB | $0.023 |
| t2.medium | 2 | 4GB | $0.046 |

## 🔒 Security Best Practices

1. **Restrict SSH Access**
   ```hcl
   # In main.tf, modify SSH ingress rule:
   cidr_blocks = ["YOUR_IP/32"]  # Instead of ["0.0.0.0/0"]
   ```

2. **Use IAM Roles**
   ```hcl
   resource "aws_iam_role" "ec2_role" {
     # Add IAM role for EC2 instance
   }
   ```

3. **Enable Encryption**
   ```hcl
   root_block_device {
     encrypted = true
   }
   ```

4. **Use Private Subnets**
   - For production, use NAT Gateway and private subnets
   - Keep EC2 in private subnet, only load balancer in public

## 🧪 Testing

### Validate Configuration
```bash
terraform validate
```

### Format Code
```bash
terraform fmt
```

### Check State
```bash
terraform show
terraform state list
```

## 🐛 Troubleshooting

### Error: No credentials found
```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
```

### Error: Region not supported
```bash
# Check available regions:
aws ec2 describe-regions --output table

# Update variables.tf or use:
terraform apply -var="aws_region=us-west-2"
```

### Error: SSH key not found
```bash
# Generate new key:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Or specify custom path:
terraform apply -var="public_key_path=/path/to/key.pub"
```

## 📝 Notes

- State file stored locally (consider using S3 backend for production)
- Default VPC CIDR: 10.0.0.0/16
- Uses latest Ubuntu 22.04 LTS AMI
- User data script installs Docker automatically

## 🔄 State Management

For production, use remote backend:

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "n-queen-visualiser/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
