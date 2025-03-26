#http-server .next/ -p 3000 --ssl --cert ../ssl/cert.pem --key ../ssl/key.pem

# desactiva cache activa cors
# http-server .next/ -p 3000 --ssl --cert ../ssl/cert.pem --key ../ssl/key.pem --cors --cache -1 --gzip --timeout 300 -i false -d false --no-dotfiles --log-ip -e .tsx


# npx http-server out/ -p 3000
npx http-server out/ -p 3000 --cors --cache -1 --gzip --timeout 300 -i false -d false --no-dotfiles --log-ip 
