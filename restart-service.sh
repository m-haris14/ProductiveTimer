#!/bin/bash

echo "Restarting Productive Timer Service..."
echo ""

# Restart the service
sudo systemctl restart productive-timer.service

# Check the status
echo ""
echo "Service status:"
sudo systemctl status productive-timer.service
