#!/bin/bash

echo "Starting Productive Timer Service..."
echo ""

# Start the service
sudo systemctl start productive-timer.service

# Check the status
echo ""
echo "Service status:"
sudo systemctl status productive-timer.service

echo ""
echo "To enable auto-start on boot, run:"
echo "sudo systemctl enable productive-timer.service"
