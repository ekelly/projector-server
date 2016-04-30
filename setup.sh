#!/bin/sh

sudo apt-get install vim tmux
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
rm node_latest_armhf.deb
sudo vi /etc/default/keyboard
sudo shutdown -r now
sudo raspi-config
