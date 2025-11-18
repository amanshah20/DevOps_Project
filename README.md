# N-Queens Visualizer ♔

A small, friendly project to visualize solutions to the N‑Queens problem. This repo contains a simple frontend (HTML/CSS/JS) and deployment automation so you can practice running the app locally (Docker) and in the cloud (AWS EC2 using Terraform + Ansible). It also includes Nagios setup for basic monitoring.

Whether you want to try the algorithm, test Docker, or practice infrastructure as code and configuration management, this README guides you step-by-step.

## Quick links
- Live app (after you deploy): http://YOUR_EC2_IP:8080
- Nagios dashboard: http://YOUR_EC2_IP/nagios4 (user: `nagiosadmin` / pass: `admin123`)

## What you'll learn by practicing with this repo
- Running the N‑Queens visualizer locally and in Docker
- Building and deploying a simple static site with Docker + Nginx
- Provisioning an EC2 instance using Terraform
- Using Ansible to install Docker, deploy the app container, and install Nagios
- Basic Nagios monitoring for the deployed service

---

## Prerequisites

Before you begin, have these installed and configured on your machine:

- Git
- Docker & docker-compose (for local testing)
- Terraform (for AWS infra)
- Ansible (use WSL on Windows for reliable behaviour)
- An AWS account and AWS CLI configured (`aws configure`)
- An SSH key pair (private key at `~/.ssh/id_rsa` recommended)

Notes for Windows users
- Run Ansible from WSL (Ubuntu) — running Ansible from Git Bash or native Windows often causes SSH/permission problems.
- Paths in examples use WSL style where appropriate (e.g. `/mnt/c/Users/...`).

---

## Project layout

```
N-Queen-Visualiser/
├── project/              # frontend files: index.html, style.css, app.js
├── terraform/            # Terraform configs to create EC2 + security group
├── ansible/              # Ansible playbooks for app + Nagios and inventory.ini
├── docker-compose.yml    # For local testing
└── Dockerfile            # For container image (Nginx + project/)
```

---

## Step-by-step: Run locally (fast)

1. Clone the repo:

```bash
git clone https://github.com/amanshah20/N-Queen-Visualiser.git
cd N-Queen-Visualiser
```

2. Start the app with docker-compose:

```bash
docker-compose up -d
# Open http://localhost:3000 (or 8080 depending on local compose settings)
```

3. Stop local containers when finished:

```bash
docker-compose down
```

This local flow is ideal for experimenting with the UI and algorithm.

---

## Step-by-step: Deploy to AWS (Terraform + Ansible)

This section shows how to provision an EC2 instance, update the Ansible inventory, deploy the Dockerized app there, and install Nagios for monitoring.

### 1) Prepare

- Ensure your AWS credentials are configured (`aws configure`) with an IAM user that can create EC2 resources.
- Confirm Terraform and Ansible are installed. On Windows use WSL for Ansible.

### 2) Create infrastructure with Terraform

```bash
cd terraform
terraform init
terraform apply
# Accept the plan. When finished note the EC2 public IP printed in terraform output.
```

If `terraform apply` returns an IP, copy it — you'll use it in the Ansible inventory.

### 3) Update Ansible inventory

Open `ansible/inventory.ini` and set the `ansible_host` to the EC2 public IP. Example:

```ini
[webservers]
ec2-instance ansible_host=YOUR_EC2_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
```

Replace `YOUR_EC2_IP` with the IP from Terraform (example `65.2.39.109`).

Notes:
- Use the `ubuntu` user (this repo's Terraform uses Ubuntu AMI). If you provision a different image change the user accordingly.

### 4) Run Ansible playbooks (deploy app + Nagios)

Run these from WSL in the repo `ansible` folder:

```bash
cd /mnt/c/Users/ASUS/Desktop/aman/N-Queen-Visualiser/ansible
ansible-playbook -i inventory.ini deploy.yml
ansible-playbook -i inventory.ini nagios.yml
```

What these do:
- `deploy.yml` installs Docker, copies the site files, builds or pulls the Docker image, and starts the container exposing port 8080 on the instance.
- `nagios.yml` installs Nagios4 + Apache and ensures the Nagios UI is accessible at `/nagios4`. A small Apache configuration fix is included so external access is allowed.

### 5) Verify

- App: open `http://YOUR_EC2_IP:8080` and you should see the N‑Queens visualizer.
- Nagios: open `http://YOUR_EC2_IP/nagios4`. Login with:
  - Username: `nagiosadmin`
  - Password: `admin123`

If pages don't load:
- Check the security group for the EC2 instance allows port 8080 and port 80 (HTTP) and 22 (SSH).
- Check Ansible logs for failed tasks.

---

## Troubleshooting tips

- SSH timeouts / key issues:
  - Ensure `~/.ssh/id_rsa` has correct permissions (chmod 600) and is the key you registered with the EC2 instance.
  - If SSH host key checking blocks you, the inventory already uses `-o StrictHostKeyChecking=no`.

- Ansible errors on Windows:
  - Run Ansible from WSL (Ubuntu). Native Windows installations often behave differently for SSH.

- Nagios shows `Forbidden` in browser:
  - The `nagios.yml` playbook contains a step that updates the Apache `Require` directive to `Require all granted`. If you still see `Forbidden`, check `/etc/apache2/sites-enabled` on the server and restart Apache:

```bash
sudo systemctl restart apache2
sudo tail -n 200 /var/log/apache2/error.log
```

- Terraform `init` slow:
  - The AWS provider can be large on first run. Use a plugin cache (`~/.terraform.d/plugin-cache`) if you repeat runs often. This is not required but speeds up subsequent `init`.

---

## Cleanup

When you're done practicing, destroy the AWS resources to avoid charges:

```bash
cd terraform
terraform destroy
```

And clean local Docker:

```bash
docker-compose down
```

---

## Notes & best practices

- Run Ansible playbooks from WSL to avoid SSH oddities on Windows.
- If you re-run `terraform destroy` and `terraform apply`, always update `ansible/inventory.ini` with the new IP or script the inventory update in your own workflow.

---

## Contributing

PRs are welcome. If you add features or tests, include a short README update describing the change.

---

## License

MIT

---

Author: Aman Shah — https://github.com/amanshah20
