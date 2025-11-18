# Ansible Deployment

This directory contains Ansible playbooks for deploying the N-Queen Visualiser application to EC2 instances.

## 📁 Files

- `deploy.yml` - Main deployment playbook
- `inventory.ini` - Server inventory
- `ansible.cfg` - Ansible configuration

## 🚀 Usage

### Quick Deploy
```bash
ansible-playbook deploy.yml
```

### Test Connection
```bash
ansible webservers -m ping
```

### Dry Run
```bash
ansible-playbook deploy.yml --check
```

### Verbose Output
```bash
ansible-playbook deploy.yml -v
ansible-playbook deploy.yml -vvv  # Very verbose
```

## 📋 What the Playbook Does

1. ✅ Updates system packages
2. ✅ Installs Docker and Docker Compose
3. ✅ Installs Python dependencies
4. ✅ Configures Docker service
5. ✅ Creates project directory
6. ✅ Copies application files
7. ✅ Builds Docker image
8. ✅ Starts Docker container
9. ✅ Verifies deployment

## ⚙️ Configuration

### Inventory Setup

Edit `inventory.ini`:
```ini
[webservers]
ec2-instance ansible_host=YOUR_EC2_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
```

### Variables

In `deploy.yml`, you can customize:

```yaml
vars:
  app_name: n-queen-visualiser
  app_port: 8080
  project_dir: /home/ubuntu/n-queen-visualiser
```

## 🎯 Tasks Breakdown

### 1. System Update
```yaml
- name: Update apt cache
  apt:
    update_cache: yes
```

### 2. Install Dependencies
```yaml
- name: Install required packages
  apt:
    name:
      - docker.io
      - docker-compose
      - git
```

### 3. Deploy Application
```yaml
- name: Build and start Docker containers
  community.docker.docker_compose:
    project_src: "{{ project_dir }}"
    build: yes
    state: present
```

## 🧪 Testing

### Verify Installation
```bash
# Check if Docker is installed
ansible webservers -m shell -a "docker --version"

# Check running containers
ansible webservers -m shell -a "docker ps"

# Test application
ansible webservers -m shell -a "curl http://localhost:8080"
```

### Gather Facts
```bash
ansible webservers -m setup
ansible webservers -m setup -a "filter=ansible_distribution*"
```

## 📊 Playbook Tags

Add tags to your playbook for selective execution:

```yaml
tasks:
  - name: Install packages
    tags: ['install']
    
  - name: Deploy app
    tags: ['deploy']
```

Run specific tags:
```bash
ansible-playbook deploy.yml --tags "install"
ansible-playbook deploy.yml --tags "deploy"
```

## 🔧 Advanced Usage

### Multiple Environments

Create environment-specific inventories:

**inventory-dev.ini**
```ini
[webservers]
dev-server ansible_host=10.0.1.10
```

**inventory-prod.ini**
```ini
[webservers]
prod-server ansible_host=52.10.20.30
```

Use with:
```bash
ansible-playbook -i inventory-prod.ini deploy.yml
```

### Custom Variables

Create `vars.yml`:
```yaml
app_name: n-queen-visualiser
app_port: 8080
docker_image: myregistry/n-queen:latest
```

Use in playbook:
```bash
ansible-playbook deploy.yml -e @vars.yml
```

### Vault for Secrets

```bash
# Create encrypted file
ansible-vault create secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# Use in playbook
ansible-playbook deploy.yml -e @secrets.yml --ask-vault-pass
```

## 🐛 Troubleshooting

### SSH Connection Failed
```bash
# Test SSH manually
ssh -i ~/.ssh/id_rsa ubuntu@<EC2_IP>

# Check key permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Disable host key checking temporarily
export ANSIBLE_HOST_KEY_CHECKING=False
```

### Permission Denied
```bash
# Ensure user has sudo access
ansible webservers -m shell -a "sudo whoami"

# Use become
ansible-playbook deploy.yml --become
```

### Module Not Found
```bash
# Install Ansible collections
ansible-galaxy collection install community.docker

# Install globally
pip install docker
```

### Slow Execution
```bash
# Enable pipelining in ansible.cfg
[ssh_connection]
pipelining = True

# Use mitogen strategy
strategy = mitogen_linear
```

## 📦 Required Ansible Collections

Install dependencies:
```bash
ansible-galaxy collection install community.docker
ansible-galaxy collection install ansible.posix
```

## 🔄 Idempotency

Ansible tasks are idempotent - running multiple times produces the same result:

```bash
# First run: Makes changes
ansible-playbook deploy.yml

# Second run: Reports "ok", no changes
ansible-playbook deploy.yml
```

## 📈 Monitoring Deployment

### Real-time Logs
```bash
# Follow playbook execution
ansible-playbook deploy.yml -v

# Check container logs on remote
ansible webservers -m shell -a "docker logs n-queen-visualiser"
```

### Performance Metrics
```bash
# Time execution
time ansible-playbook deploy.yml

# Profile tasks (add to ansible.cfg)
[defaults]
callback_whitelist = profile_tasks
```

## 🌐 Multi-Server Deployment

Deploy to multiple servers:

```ini
[webservers]
server1 ansible_host=10.0.1.10
server2 ansible_host=10.0.1.11
server3 ansible_host=10.0.1.12

[webservers:vars]
ansible_user=ubuntu
```

Run with:
```bash
ansible-playbook deploy.yml
```

## 📝 Best Practices

1. **Use Variables**: Keep playbooks flexible
2. **Add Handlers**: Restart services only when needed
3. **Error Handling**: Use `ignore_errors` and `failed_when`
4. **Notifications**: Add `notify` for service restarts
5. **Documentation**: Comment complex tasks
6. **Version Control**: Keep playbooks in Git
7. **Testing**: Always use `--check` first

## 🔐 Security Considerations

1. **Use Vault**: Encrypt sensitive data
2. **Limit SSH Keys**: Use dedicated deployment keys
3. **Sudo Password**: Use `--ask-become-pass` when needed
4. **No Root User**: Always use regular user with sudo
5. **Firewall Rules**: Configure UFW/iptables

## 📚 Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
