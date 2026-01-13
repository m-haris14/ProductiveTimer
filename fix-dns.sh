#!/bin/bash

echo "Configuring DNS to use Google DNS servers..."
echo ""

# Add Google DNS to systemd-resolved
sudo mkdir -p /etc/systemd/resolved.conf.d/
sudo tee /etc/systemd/resolved.conf.d/dns_servers.conf > /dev/null <<EOF
[Resolve]
DNS=8.8.8.8 8.8.4.4 192.168.1.1
FallbackDNS=1.1.1.1 1.0.0.1
EOF

echo "✅ DNS configuration file created"
echo ""

# Restart systemd-resolved
sudo systemctl restart systemd-resolved

echo "✅ systemd-resolved restarted"
echo ""

# Verify DNS configuration
echo "Current DNS configuration:"
resolvectl status | grep -A 5 "DNS Servers"

echo ""
echo "Testing MongoDB DNS resolution..."
dig @8.8.8.8 _mongodb._tcp.cluster0.9cxyxo9.mongodb.net SRV +short

echo ""
echo "✅ DNS configuration complete!"
echo ""
echo "Now restart the productive-timer service:"
echo "sudo systemctl restart productive-timer.service"
