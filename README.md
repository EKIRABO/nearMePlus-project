# NearMe - Nearby Places Finder

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [APIs Used](#apis-used)
4. [Local Setup Instructions](#local-setup-instructions)
5. [Deployment to Web Servers](#deployment-to-web-servers)
6. [Load Balancer Configuration](#load-balancer-configuration)
7. [Testing & Verification](#testing--verification)
8. [Challenges & Solutions](#challenges--solutions)



## Overview

**NearMe** is a simple web app that helps you discover nearby places and upcoming events based on your current location.
It uses multiple APIs and displays results on an interactive Mapbox map.

### Purpose & Value
It's helpful when:

You're in a new area and need services quickly

You want to explore restaurants or entertainment

You need emergency services

You simply want to discover what's around you

Unlike simple entertainment apps, NearMe provides genuine utility by solving the real-world problem of location discovery and navigation.


## Features

**Real-time Location Detection** - Automatically detects the user's current location using browser geolocation  
**Category-based Search** - Search for restaurants, cafes, hospitals, gas stations, parks, and more  
**Interactive Map Display** - Visual representation of nearby places on Mapbox
**Distance Calculation** - Shows distance from the user's current location 
**Sorting & Filtering** - Sort results by distance
**Responsive Design** - Works seamlessly on desktop and mobile devices  
**Error Handling** - Graceful handling of API failures and network issues

## APIs Used

## Mapbox API – Map display + Reverse geocoding

## OpenStreetMap – Base map data

## Geoapify Places API – Nearby places

## Ticketmaster API – Events

## PredictHQ API – Events

## Browser Geolocation API – User location

## API Key Management

1. API keys are stored in a separate keys.js file

2. keys.js is excluded from version control via .gitignore
   
3. On deployed servers, keys are manually configured post-deployment

## Local Setup Instructions

### Steps to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/EKIRABO/nearme-project.git
   cd nearme-project/NearMe1
   ```

2. **Create the API keys file and add your keys to the file**
   ```bash
   # Create keys.js in the project root
   touch keys.js
   ```

4. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server
   ```bash

5. **Grant location permissions**
   - When prompted, allow the browser to access your location or type in a city
   - The app will automatically load nearby places and events

6. **Interact with the application**
   - Select different categories from the dropdown
   - Click on place cards to view details
   - Sort results by distance 
   - Click markers on the map to see place information

## Deployment to Web Servers

### Architecture Overview
```
User → Lb01 (Load Balancer) → Web01 (Nginx)
                             → Web02 (Nginx)
```

### Server Details
- **Web01**: Primary web server hosting the application
- **Web02**: Secondary web server hosting the application
- **Lb01**: Load balancer distributing traffic between Web01 and Web02

---

### Step 1: Prepare Application for Deployment

**Files to deploy:**
- `index.html` - Main HTML file
- `index.js` - Application JavaScript
- `styles.css` - Stylesheet
- `.gitignore` - Excludes sensitive files

**Files NOT to deploy:**
- `keys.js` - Created manually on servers (contains sensitive API keys)

### Step 2: Deploy to Web01

#### 2.1 Connect to Web01
```bash
ssh username@web01_ip_address
```
#### 2.2 Install Nginx Web Server
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

#### 2.3 Create Application Directory
```bash
# Create a directory for the application
sudo mkdir -p /var/www/nearme

# Set ownership to current user
sudo chown -R $USER:$USER /var/www/nearme

# Set proper permissions
sudo chmod -R 755 /var/www/nearme
```

#### 2.4 Upload Application Files

**From your local machine:**
```bash
# Navigate to your project directory
cd /path/to/nearme-project/NearMe1

# Upload files using SCP (exclude keys.js)
scp index.html index.js styles.css username@web01_ip:/var/www/nearme/

#### 2.5 Configure Nginx on Web01

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/nearme
```

**Add this to the configuration:**
```nginx
server {
    listen 80;
    listen [::]:80;
    
    root /var/www/nearme;
    index index.html;
    
    server_name web01_ip_address;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Enable gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nearme /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Configure firewall (if UFW is enabled)
sudo ufw allow 'Nginx Full'
sudo ufw status
```

#### 2.6 Add API Keys to Web-01

```bash
# Create keys.js file on the server
nano /var/www/nearme/keys.js
```

**Add your API key:**
```javascript
 example: const API_KEYs = 'your_api_keys';
```

```bash

# Set appropriate permissions
chmod 644 /var/www/nearme/keys.js

# Verify file was created
ls -la /var/www/nearme/keys.js
```

#### 2.7 Test Web-01

```bash
# Test from the server itself
curl http://localhost

# Check if you get an HTML response
curl -I http://web01_ip_address
```

**From your local machine:**
- Open browser and navigate to: `http://web01_ip_address`
- Verify the application loads correctly
- Test all features (location, search, map display)

### Step 3: Deploy to Web02

**Repeat all steps from Step 2 for Web-02**

## Load Balancer Configuration

### Step 1: Connect to Lb01

```bash
ssh username@lb01_ip_address
```

### Step 2: Install Nginx on LB01

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: Configure Load Balancer

```bash
# Create load balancer configuration
sudo nano /etc/nginx/sites-available/nearme-lb
```

**Add this to the configuration:**

```nginx
# Define upstream backend servers
upstream nearme_backend {
    # Round-robin load balancing (default algorithm)
    # Requests are distributed evenly between servers
    server web01_ip_address:80 max_fails=3 fail_timeout=30s;
    server web02_ip_address:80 max_fails=3 fail_timeout=30s;
    
    # Health check parameters:
    # max_fails: Number of failed attempts before marking server as down
    # fail_timeout: Time server is considered down after max_fails reached
    
    # Keep persistent connections to backend servers
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    
    server_name lb01_ip_address;
    
    # Logging for monitoring and debugging
    access_log /var/log/nginx/nearme_lb_access.log;
    error_log /var/log/nginx/nearme_lb_error.log;
    
    location / {
        # Forward requests to backend servers
        proxy_pass http://nearme_backend;
        
        # Preserve client information
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout configurations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Enable HTTP/1.1 for better performance
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "Load Balancer is healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Status page for monitoring
    location /lb-status {
        access_log off;
        return 200 "Backend servers: Web01, Web02\nAlgorithm: Round Robin\n";
        add_header Content-Type text/plain;
    }
}
```

### Step 4: Enable and Start Load Balancer

```bash
# Enable the configuration
sudo ln -s /etc/nginx/sites-available/nearme-lb /etc/nginx/sites-enabled/

# Remove default configuration (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration for syntax errors
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
```

### Step 5: Verify Load Balancer Configuration

```bash
# Check Nginx status
sudo systemctl status nginx

# View configuration
sudo nginx -T | grep -A 20 "upstream nearme_backend"

# Test health endpoint
curl http://localhost/health
```

---

## Testing & Verification

### Test 1: Individual Server Functionality

**Test Web01:**
```bash
# From local machine
curl -I http://web01_ip_address

# Should return: HTTP/1.1 200 OK
```

**Test Web02:**
```bash
curl -I http://web02_ip_address

# Should return: HTTP/1.1 200 OK
```

**Browser testing:**
- Open `http://web01_ip_address` - verify application works
- Open `http://web02_ip_address` - verify application works

---

### Test 2: Load Balancer Functionality

**Basic connectivity:**
```bash
# Test load balancer
curl http://lb01_ip_address

# Should return the HTML content of the application
```

**Multiple requests test:**
```bash
# Send 10 requests and check responses
for i in {1..10}; do
    echo "Request $i:"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://lb01_ip_address
    sleep 1
done
```

All requests should return `HTTP Status: 200`

---

### Test 3: Load Distribution Verification

**Method 1: Check Server Access Logs**

```bash
# On Web01 - open one terminal
ssh username@web01_ip
sudo tail -f /var/log/nginx/access.log

# On Web02 - open another terminal
ssh username@web02_ip
sudo tail -f /var/log/nginx/access.log

# From your local machine, make multiple requests:
for i in {1..20}; do curl http://lb01_ip_address > /dev/null 2>&1; done
```

You should see requests appearing in **both** Web01 and Web02 logs, roughly evenly distributed.

**Method 2: Add Server Identifiers**

Temporarily modify the application to identify which server is responding:

```bash
# On Web01
ssh username@web01_ip
sudo nano /var/www/nearme/index.html

# Add at the bottom of <body> tag, before </body>:
<!-- Served by Web01 -->

# On Web02
ssh username@web02_ip
sudo nano /var/www/nearme/index.html

# Add at the bottom of <body> tag, before </body>:
<!-- Served by Web02 -->
```

Now open the load balancer URL in a browser and refresh multiple times. View page source (Ctrl+U) to see which server responded.

**Remove identifiers after testing:**
```bash
# Remove the comments from both servers
sudo nano /var/www/nearme/index.html
```

---

### Test 4: Failover Testing

**Test 1: Stop Web01**
```bash
# SSH into Web01
ssh username@web01_ip
sudo systemctl stop nginx

# Test load balancer - should still work via Web02
curl http://lb01_ip_address
# Should return: HTTP 200 OK

# Restart Web01
sudo systemctl start nginx
```

**Test 2: Stop Web02**
```bash
# SSH into Web02
ssh username@web02_ip
sudo systemctl stop nginx

# Test load balancer - should still work via Web01
curl http://lb01_ip_address
# Should return: HTTP 200 OK

# Restart Web02
sudo systemctl start nginx
```

**Both servers running:**
```bash
# Verify both servers are up
curl -I http://web01_ip_address
curl -I http://web02_ip_address

# Test load balancer
curl -I http://lb01_ip_address
```


## Monitoring & Maintenance

### Monitor Load Balancer

```bash
# Check Nginx status
sudo systemctl status nginx

# View real-time access logs
sudo tail -f /var/log/nginx/nearme_lb_access.log

# View error logs
sudo tail -f /var/log/nginx/nearme_lb_error.log

# Count requests per backend server
sudo awk '{print $1}' /var/log/nginx/nearme_lb_access.log | sort | uniq -c
```

### Monitor Backend Servers

```bash
# Check server status remotely
ssh username@web01_ip "sudo systemctl status nginx"
ssh username@web02_ip "sudo systemctl status nginx"

# Check disk space
ssh username@web01_ip "df -h"

# Check memory usage
ssh username@web01_ip "free -m"
```



## Challenges & Solutions

### Challenge 1: API Key Security
**Problem**: How to keep API keys secure while deploying to servers.

**Solution**: 
- Used `.gitignore` to exclude `keys.js` from version control
- Manually created `keys.js` on each server after deployment
- Provided API keys to instructors separately via secure submission comments
- Implemented proper file permissions (chmod 644) on servers

### Challenge 2: Load Balancer Configuration
**Problem**: Ensuring traffic is evenly distributed between two servers.

**Solution**:
- Implemented Nginx upstream with round-robin algorithm (default)
- Added health check parameters (max_fails, fail_timeout)
- Verified distribution by monitoring access logs on both servers
- Tested failover by stopping services on individual servers

### Challenge 3: User Location Permissions
**Problem**: Users may deny location access or use browsers that do not support geolocation.

**Solution**:
- Implemented fallback to default location (city center)
- Added clear instructions for users to enable location permissions
- Provided a manual search option as an alternative to automatic location
- Added error messages explaining how to fix permission issues

### Technologies Used
- **Nginx** - Web server and load balancer
  - Documentation: https://nginx.org/en/docs/
- **HTML5 Geolocation API** - Browser-based location detection
- **Vanilla JavaScript** - No external frameworks, pure JS implementation
- **CSS3** - Modern styling and responsive design


**Video Link**: 

## Project Structure

NearMe1/
├── index.html          # Main HTML file
├── index.js            # Application JavaScript logic
├── styles.css          # Styling and layout
├── keys.js             # API keys (excluded from Git)
├── .gitignore          # Git exclusion rules
└── README.md           # This documentation file







