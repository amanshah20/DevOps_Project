# Quick Start Guide — N-Queen Visualiser

This Quick Start shows three paths: run locally with Docker, deploy to AWS (Terraform + Ansible), or use the included one-command deploy script. Each path is step-by-step and uses bash (your default shell: `bash.exe`). Windows users should prefer running Ansible from WSL (Ubuntu) — notes are included.

## Summary links
- Local app: http://localhost:8080
- Remote app (after AWS deploy): http://$INSTANCE_IP:8080
- Nagios dashboard (after Nagios playbook): http://$INSTANCE_IP/nagios4

> Default Nagios credentials created by the playbook:
- Username: `nagiosadmin`
- Password: `admin123`

## Prerequisites (quick)
- Git
- Docker & docker-compose
- Terraform (for AWS path)
- Ansible (run from WSL on Windows)
- AWS CLI configured (`aws configure`)
- SSH key pair (private key at `~/.ssh/id_rsa` recommended)

If any of the above are missing, install them first. On Windows, use WSL for Ansible and any Linux-like commands.

---

## Path 1 — Run locally (fast, ~5 minutes)

1. Clone the repo and change directory:

```bash
git clone https://github.com/amanshah20/DevOps_Project.git
cd N-Queen-Visualiser
```

2. Start the app with Docker Compose:

```bash
docker-compose up -d
# Wait a couple seconds, then open:
http://localhost:8080
```

3. When finished, stop the containers:

```bash
docker-compose down
```

Notes:
- The local `docker-compose.yml` maps port 3000 -> 80. If you don't see the app at 8080, try http://localhost:3000.

---

## Path 2 — Deploy to AWS (Terraform + Ansible) — detailed steps (~15–20 minutes)

This path provisions an EC2 instance, deploys the Dockerized app onto it, and installs Nagios for monitoring.

### 0) Notes about Windows + WSL
- If you are on Windows, run the Terraform commands from your current shell, but run Ansible from WSL/Ubuntu to avoid SSH issues. Paths shown use POSIX style; in WSL your home is `~`.

### 1) Configure AWS CLI

```bash
aws configure
# Enter your Access Key, Secret, preferred region (e.g. us-east-1) and json output
```

### 2) (Optional) Generate SSH key

If you don't have an SSH key at `~/.ssh/id_rsa`:

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

Make sure the public key path is referenced by Terraform (`terraform/variables.tf` uses `public_key_path`).

### 3) Provision infrastructure with Terraform

Run from the `terraform` folder:

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

When complete, capture the instance IP into an env var (bash):

```bash
export INSTANCE_IP=$(terraform output -raw instance_public_ip)
echo "Instance IP: $INSTANCE_IP"
```

If `terraform output` does not return `instance_public_ip`, run `terraform output` to see available outputs.

### 4) Update the Ansible inventory

Switch to the `ansible` directory and create/update `inventory.ini` using the IP from Terraform:

```bash
cd ../ansible
cat > inventory.ini <<EOF
[webservers]
ec2-instance ansible_host=$INSTANCE_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
EOF

# Quick test (from WSL if Windows):
ansible -i inventory.ini webservers -m ping
```

If the ping fails, wait ~30–60s for the instance to finish booting and try again.

### 5) Deploy the application with Ansible

From the `ansible` folder run:

```bash
# Wait a short time for SSH to be ready
sleep 30

ansible-playbook -i inventory.ini deploy.yml
```

What the playbook does:
- Installs Docker and docker-compose on the EC2 instance
- Copies the project files and Dockerfile
- Builds the Docker image and runs the container mapping port 8080

### 6) (Optional) Install Nagios monitoring

To install Nagios and a basic check for the app, run:

```bash
ansible-playbook -i inventory.ini nagios.yml
```

The Nagios playbook:
- Installs `nagios4`, `nagios-plugins`, and `apache2` pieces
- Creates the `nagiosadmin` user with password `admin123` (can be changed in the playbook)
- Adjusts the Apache config so Nagios is reachable from external hosts

### 7) Accessing the app and Nagios

- App URL: http://$INSTANCE_IP:8080
- Nagios URL: http://$INSTANCE_IP/nagios4

Nagios default credentials:
- Username: `nagiosadmin`
- Password: `admin123`

If you don't see pages, check the EC2 security group allows ports 22, 80 and 8080.

---

## Path 3 — One-command deploy (convenient)

There is a `deploy.sh` script to automate the full flow. Use it from bash (it will prompt a menu):

```bash
chmod +x deploy.sh
./deploy.sh
```

Menu options include: test locally, deploy to AWS, full deployment (local then AWS), and destroy infra.

---

## Testing after deployment

Local test:

```bash
curl http://localhost:8080
```

Remote test (replace `<EC2_IP>` with your instance IP):

```bash
curl http://$INSTANCE_IP:8080
curl http://$INSTANCE_IP/nagios4  # Nagios page
```

---

## Cleanup

Stop local containers:

```bash
docker-compose down
```

Destroy AWS resources (from `terraform` dir):

```bash
cd terraform
terraform destroy -auto-approve
```

If you used the `deploy.sh`, you can also select its destroy option.

---

## Common issues & quick fixes

- SSH connection refused: wait 30–60s and re-run `ansible -i inventory.ini webservers -m ping`. Verify `~/.ssh/id_rsa` permissions (chmod 600).
- Firewall / Security group: ensure ports 22, 80 and 8080 are allowed.
- Nagios Forbidden page: the playbook updates `/etc/apache2/conf-available/nagios4-cgi.conf` to `Require all granted` and restarts Apache. If still Forbidden, ssh into the server and inspect `/var/log/apache2/error.log`.
- Ansible on Windows: use WSL for reliable SSH behavior.

---

## Where to look next
- Full deployment and troubleshooting: see `DEPLOYMENT.md`.
- Ansible playbooks: `ansible/deploy.yml`, `ansible/nagios.yml`.
- Infrastructure: `terraform/main.tf`, `terraform/outputs.tf`.

---

Enjoy your N-Queen Visualiser! 🎉
