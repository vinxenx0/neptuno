cat /etc/os-release 
ufw
iptables -L
htop
top
ping google.es
ls -la
cd /
ls -la
cd /home/
ls -la
cd ..
htop
top
apt update && apt upgrade -y
apt install htop git nettools curl wget pgnp
apt install htop git net-tools curl wget
python3
python3 -version
python3 --version
pip3 --version
pip --version
node
npm
npx
nvm
free -h
dh
dh
mount
free
df -h
cd --
nano sys.sh
chmod +x sys.sh 
./sys.sh 
nano sys.sh
./sys.sh 
hostname
apt install nginx -y
systemctl enable nginx
systemctl start nginx
apt install certbot python3-certbot-nginx -y
mkdir -p /var/www/ciberpunk.es/httpdocs
chown -R www-data:www-data /var/www/ciberpunk.es
nano /etc/nginx/sites-available/ciberpunk.es
ln -s /etc/nginx/sites-available/ciberpunk.es /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
nano /etc/nginx/sites-available/ciberpunk.es
echo "<h1>Hola desde ciberpunk.es</h1>" > /var/www/ciberpunk.es/html/index.html
echo "<h1>Hola desde ciberpunk.es</h1>" > /var/www/ciberpunk.es/httpdocs/index.html
nano /etc/nginx/sites-available/ciberpunk.es
systemctl restart nginx
mkdir -p /var/www/neptuno
nano /etc/nginx/sites-available/neptuno
ln -s /etc/nginx/sites-available/neptuno /etc/nginx/sites-enabled/
echo "<h1>Neptuno</h1>" > /var/www/neptuno/index.html
systemctl restart nginx
certbot --nginx -d ciberpunk.es -d www.ciberpunk.es
dig ciberpunk.es
apt install dig
certbot --nginx -d ciberpunk.es -d www.ciberpunk.es --test-cert
apt install dnsutils
dig ciberpunk.es
certbot --nginx -d ciberpunk.es -d www.ciberpunk.es
cd /etc/nginx/sites-available/
ls -la
mv neptuno neptuno.ciberpunk.es
cat ciberpunk.es 
cd ..
certbot --nginx -d ciberpunk.es -d neptuno.ciberpunk.es -d www.ciberpunk.es --force-renew
cd sites-enabled/
ls -la
rm neptuno 
ln -s /etc/nginx/sites-available/neptuno.ciberpunk.es /etc/nginx/sites-enabled/
systemctl restart nginx
certbot --nginx -d ciberpunk.es -d neptuno.ciberpunk.es -d www.ciberpunk.es --force-renew
cd --
apt install ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
python3 --version
cd --
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm --version
nvm install --lts
nvm use --lts
nvm alias default lts/*
node -v
npm -v
ls -la
nano fw.sh
chmod +x fw.sh 
./fw.sh 
cat fw.sh 
nano /etc/ssh/sshd_config
nano /etc/ssh/sshd_config
nano fw.sh
nano fw.sh
./fw.sh 
ufw status numbered
ufw numbered
apt update && apt upgrade -y
apt install unattended-upgrades -y
dpkg-reconfigure --priority=low unattended-upgrades
nano fw.sh
./fw.sh 
nano /etc/ssh/sshd_config
apt install sudo
adduser neptuno
usermod -aG sudo neptuno 
mkdir -p /home/neptuno/.ssh
nano /home/neptuno/.ssh/authorized_keys
chmod 700 /home/neptuno/.ssh
chmod 600 /home/neptuno/.ssh/authorized_keys 
chown neptuno:neptuno /home/neptuno/.ssh
nano /etc/ssh/sshd_config
ufw enable
cat fw.sh 
systemctl sshd restart
systemctl restart sshd
su neptuno
exit
cd --
cat .bash_history 
source .bashrc 
nano /etc/nginx/nginx.conf 
cp  /etc/nginx/nginx.conf  /etc/nginx/nginx.conf.bak
nano /etc/nginx/nginx.conf 
nginx -t
sudo apt install -y fail2ban
sudo nano /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
sudo systemctl list-units --type=service
sudo systemctl status fail2ban
sudo nano /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
rm -rf /etc/fail2ban/jail.local 
sudo nano /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.d/sshd.local
sudo grep "sshd" /var/log/auth.log
sudo grep -i "sshd" /var/log/*
sudo journalctl -u ssh --no-pager | grep "Failed"
sudo nano /etc/fail2ban/jail.d/sshd.local
sudo systemctl restart fail2ban
sudo systemctl status fail2ban
sudo fail2ban-client status sshd
cd /var/log/
ls -la
cat journal/
ls -la
sudo rm -f /var/run/fail2ban/fail2ban.sock
sudo fail2ban-server -xf -v start
sudo systemctl daemon-reload
sudo systemctl status fail2ban
sudo fail2ban-server -xf -v start
sudo nano /etc/fail2ban/jail.d/sshd.local
sudo systemctl restart fail2ban
sudo systemctl reload fail2ban
sudo systemctl status fail2ban
sudo tail -f /var/log/fail2ban.log
sudo nano /etc/fail2ban/jail.d/sshd.local
sudo nano /etc/fail2ban/jail.d/sshd.local
sudo systemctl reload fail2ban
sudo systemctl restart fail2ban
sudo systemctl status fail2ban
sudo apt install -y htop logwatch
sudo nano /etc/security/limits.conf
sudo nano /etc/sysctl.conf
sudo sysctl -p
sudo systemctl restart nginx
sudo apt install -y build-essential libpcre3-dev zlib1g-dev libssl-dev git
sudo aa-status
sudo apt install -y apparmor apparmor-utils
sudo apt install -y clamav clamav-daemon
sudo freshclam
sudo groupadd clamav
sudo useradd -g clamav -s /bin/false -c "Clam Antivirus" clamav
sudo chown -R clamav:clamav /var/lib/clamav
sudo mkdir -p /var/log/clamav/
sudo mkdir -p /var/log/clamav/
sudo freshclam
cat /var/log/clamav/freshclam.log 
sudo systemctl restart clamav-daemon
sudo systemctl status clamav-daemon
freshclam 
sudo systemctl stop clamav-daemon clamav-freshclam
sudo rm -f /var/log/clamav/freshclam.log.lock
sudo touch /var/log/clamav/freshclam.log
sudo nano /etc/clamav/freshclam.conf
sudo systemctl start clamav-freshclam
sudo freshclam -v
cd /var/log/clamav/
ls -la
sudo systemctl enable clamav-freshclam
sudo systemctl start clamav-freshclam
sudo freshclam -v
sudo freshclam 
sudo apt install -y apt-transport-https ca-certificates curl gnupg
sudo systemctl stop clamav-daemon clamav-freshclam
sudo rm -f /var/log/clamav/*.log*
ps aux | grep clam
sudo dpkg-reconfigure clamav-base clamav-freshclam
sudo mkdir -p /var/run/clamav
sudo -u clamav freshclam --verbose
sudo apt install -y rsync tar awscli
sudo aa-status | grep clamav  # Verificar perfiles activos
sudo aa-status | grep clamav
sudo aa-status
sudo systemctl restart apparmor
sudo freshclam 
sudo systemctl stop clamav-freshclam.service
sudo freshclam 
sudo systemctl start clamav-freshclam.service
cd --
nano docker.sh
chmod +x docker.sh 
cp docker.sh /home/neptuno/
