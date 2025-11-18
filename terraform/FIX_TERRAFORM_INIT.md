# Fixing Terraform Init Taking Too Long

## Why It's Slow
- AWS provider v5.x is ~400MB in size
- Network speed affects download time
- First-time download always takes longest

## Quick Solutions

### Solution 1: Use Plugin Cache (RECOMMENDED)
```bash
# Create terraform plugin cache directory
mkdir -p $HOME/.terraform.d/plugin-cache

# Configure terraform to use cache
cat > $HOME/.terraformrc <<EOF
plugin_cache_dir = "$HOME/.terraform.d/plugin-cache"
EOF

# Now run terraform init - subsequent inits will be instant
cd terraform
terraform init
```

### Solution 2: Increase Timeout
```bash
# Set longer timeout (20 minutes)
export TF_PLUGIN_TIMEOUT=1200

# Then run init
terraform init
```

### Solution 3: Use Mirror or Proxy
```bash
# If you're in a region with slow access to registry.terraform.io
# Use terraform CLI config
cat > $HOME/.terraformrc <<EOF
provider_installation {
  network_mirror {
    url = "https://terraform-mirror.example.com/"
  }
}
EOF
```

### Solution 4: Manual Download (FASTEST)
```bash
# Download provider manually from releases
# For Windows AMD64:
cd terraform

# Create plugins directory
mkdir -p .terraform/providers/registry.terraform.io/hashicorp/aws/4.67.0/windows_amd64

# Download from: https://releases.hashicorp.com/terraform-provider-aws/4.67.0/
# Place the terraform-provider-aws_v4.67.0_x5.exe in the above directory

# Then run init - it will use local copy
terraform init -plugin-dir=.terraform/providers
```

### Solution 5: Skip Provider Lock (Quick but not recommended for production)
```bash
terraform init -upgrade -lockfile=readonly
```

## Alternative: Use AWS CLI Instead

If Terraform is too slow, you can deploy directly with AWS CLI:

```bash
# Launch EC2 instance directly
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name my-key \
  --security-group-ids sg-xxxxx \
  --user-data file://user-data.sh
```

## Best Solution: Docker-Only Deployment

Skip AWS entirely and just use Docker locally:

```bash
# Just run locally
docker-compose up -d

# Access at http://localhost:3000
```

## Progress Monitor

While terraform init is running, monitor progress:

```bash
# In another terminal
du -sh ~/.terraform.d/plugin-cache/*
# or
ls -lh .terraform/providers/registry.terraform.io/hashicorp/aws/
```

## Estimated Times

| Provider Version | Size | Download Time (10 Mbps) | Download Time (1 Mbps) |
|------------------|------|-------------------------|------------------------|
| AWS 5.100.0 | ~400MB | 5-8 minutes | 40-50 minutes |
| AWS 4.67.0 | ~300MB | 4-6 minutes | 30-40 minutes |
| AWS 3.76.0 | ~200MB | 3-4 minutes | 20-25 minutes |

## Check Your Network Speed

```bash
# Test download speed
curl -o /dev/null https://releases.hashicorp.com/terraform-provider-aws/4.67.0/terraform-provider-aws_4.67.0_windows_amd64.zip
```

## Use Lightweight Alternative

Instead of full Terraform, use **terraform-local** or **localstack** for testing.
