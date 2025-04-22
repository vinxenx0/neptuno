
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface NginxFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const NginxForm = ({ data, onChange }: NginxFormProps) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const generateNginxConfig = () => {
    const config = `
server {
    server_name ${data.serverName};
    
    ${data.enableSSL ? `
    listen 443 ssl http2;
    ssl_certificate ${data.sslCertPath};
    ssl_certificate_key ${data.sslKeyPath};
    ` : 'listen 80;'}
    
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout ${data.proxyTimeout}s;
        proxy_read_timeout ${data.proxyTimeout}s;
        proxy_send_timeout ${data.proxyTimeout}s;
    }

    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_read_timeout ${data.apiTimeout}s;
        proxy_connect_timeout ${data.apiTimeout}s;
        proxy_send_timeout ${data.apiTimeout}s;
    }

    ${data.enableCache ? `
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires ${data.staticCacheTime}d;
        add_header Cache-Control "public, no-transform";
    }
    ` : ''}
}`;

    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nginx.conf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="input-group">
        <Label htmlFor="serverName" className="text-base font-medium">Server Name</Label>
        <p className="text-sm text-slate-500 mt-1">Your domain name</p>
        <Input
          id="serverName"
          value={data.serverName}
          onChange={(e) => handleChange("serverName", e.target.value)}
          className="mt-2"
          placeholder="example.com"
        />
      </div>

      <div className="input-group">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableSSL" className="text-base font-medium">Enable SSL</Label>
            <p className="text-sm text-slate-500 mt-1">Use HTTPS with SSL certificate</p>
          </div>
          <Switch
            id="enableSSL"
            checked={data.enableSSL}
            onCheckedChange={(checked) => handleChange("enableSSL", checked)}
          />
        </div>
      </div>

      {data.enableSSL && (
        <>
          <div className="input-group">
            <Label htmlFor="sslCertPath" className="text-base font-medium">SSL Certificate Path</Label>
            <Input
              id="sslCertPath"
              value={data.sslCertPath}
              onChange={(e) => handleChange("sslCertPath", e.target.value)}
              className="mt-2"
              placeholder="/etc/letsencrypt/live/domain/fullchain.pem"
            />
          </div>

          <div className="input-group">
            <Label htmlFor="sslKeyPath" className="text-base font-medium">SSL Key Path</Label>
            <Input
              id="sslKeyPath"
              value={data.sslKeyPath}
              onChange={(e) => handleChange("sslKeyPath", e.target.value)}
              className="mt-2"
              placeholder="/etc/letsencrypt/live/domain/privkey.pem"
            />
          </div>
        </>
      )}

      <div className="input-group">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enableCache" className="text-base font-medium">Enable Static Cache</Label>
            <p className="text-sm text-slate-500 mt-1">Cache static files for better performance</p>
          </div>
          <Switch
            id="enableCache"
            checked={data.enableCache}
            onCheckedChange={(checked) => handleChange("enableCache", checked)}
          />
        </div>
      </div>

      {data.enableCache && (
        <div className="input-group">
          <Label htmlFor="staticCacheTime" className="text-base font-medium">Cache Duration (days)</Label>
          <Input
            id="staticCacheTime"
            type="number"
            value={data.staticCacheTime}
            onChange={(e) => handleChange("staticCacheTime", e.target.value)}
            className="mt-2"
            placeholder="30"
          />
        </div>
      )}

      <div className="input-group">
        <Label htmlFor="proxyTimeout" className="text-base font-medium">Frontend Proxy Timeout (seconds)</Label>
        <Input
          id="proxyTimeout"
          type="number"
          value={data.proxyTimeout}
          onChange={(e) => handleChange("proxyTimeout", e.target.value)}
          className="mt-2"
          placeholder="30"
        />
      </div>

      <div className="input-group">
        <Label htmlFor="apiTimeout" className="text-base font-medium">API Proxy Timeout (seconds)</Label>
        <Input
          id="apiTimeout"
          type="number"
          value={data.apiTimeout}
          onChange={(e) => handleChange("apiTimeout", e.target.value)}
          className="mt-2"
          placeholder="300"
        />
      </div>

      <Button 
        onClick={generateNginxConfig}
        className="w-full mt-4 flex items-center gap-2 justify-center"
      >
        <FileDown className="h-4 w-4" />
        Download Nginx Configuration
      </Button>
    </div>
  );
};
