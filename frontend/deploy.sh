rm -rf .next node_modules out
npm install
npm run build
# npx http-server out/ -p 3000 --ssl --cert ../ssl/cert.pem --key ../ssl/key.pem --cors --cache -1 --gzip --timeout 300 -i false -d false --no-dotfiles --log-ip
npx http-server out/ -p 3000 --cors --cache -1 --gzip --timeout 300 -i false -d false --no-dotfiles 

# "start": "npx http-server out/ -p 3000 --ssl --cert ../ssl/cert.pem --key ../ssl/key.pem --cors",