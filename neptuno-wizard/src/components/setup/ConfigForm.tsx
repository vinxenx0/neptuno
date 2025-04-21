import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Settings, Server, Key, Database, Monitor, Network } from "lucide-react";
import { useState, useEffect } from "react";
import { NeptunoConfig, ConfigSection } from "@/types/config";
import { ProjectForm } from "./forms/ProjectForm";
import { NginxForm } from "./forms/NginxForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

interface ConfigFormProps {
  section: ConfigSection;
  config: NeptunoConfig;
  onUpdate: (section: ConfigSection, data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

const sectionIcons = {
  project: <Globe className="h-5 w-5 text-blue-500" />,
  environment: <Settings className="h-5 w-5 text-green-500" />,
  server: <Server className="h-5 w-5 text-amber-500" />,
  auth: <Key className="h-5 w-5 text-purple-500" />,
  redis: <Database className="h-5 w-5 text-red-500" />,
  frontend: <Monitor className="h-5 w-5 text-cyan-500" />,
};

const ConfigForm = ({ section, config, onUpdate, onNext, onBack }: ConfigFormProps) => {
  const renderFormContent = () => {
    switch (section) {
      case "project":
        return <ProjectForm data={config[section]} onChange={(data) => onUpdate(section, data)} />;
      case "server":
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Database Configuration</h3>
              <div className="space-y-4">
                <div className="input-group">
                  <Label htmlFor="dbType" className="text-base font-medium mb-1 block">Database Type</Label>
                  <p className="text-sm text-slate-500 mb-2">Database engine type</p>
                  <Select value={config.server.dbType} onValueChange={(value) => onUpdate(section, { ...config[section], dbType: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres" className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" /> PostgreSQL
                      </SelectItem>
                      <SelectItem value="mysql" className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-orange-500" /> MySQL
                      </SelectItem>
                      <SelectItem value="mongodb" className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-500" /> MongoDB
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label htmlFor="dbHost" className="text-base font-medium mb-1 block">Database Host</Label>
                  <p className="text-sm text-slate-500 mb-2">Database server hostname</p>
                  <Input
                    id="dbHost"
                    value={config.server.dbHost}
                    onChange={(e) => onUpdate(section, { ...config[section], dbHost: e.target.value })}
                    placeholder="localhost"
                    className="border-slate-300 focus:border-accent focus:ring-accent"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="dbPort" className="text-base font-medium mb-1 block">Database Port</Label>
                  <p className="text-sm text-slate-500 mb-2">Database server port</p>
                  <Input
                    id="dbPort"
                    value={config.server.dbPort}
                    onChange={(e) => onUpdate(section, { ...config[section], dbPort: e.target.value })}
                    placeholder="5432"
                    className="border-slate-300 focus:border-accent focus:ring-accent"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="dbUser" className="text-base font-medium mb-1 block">Database User</Label>
                  <p className="text-sm text-slate-500 mb-2">Database username</p>
                  <Input
                    id="dbUser"
                    value={config.server.dbUser}
                    onChange={(e) => onUpdate(section, { ...config[section], dbUser: e.target.value })}
                    placeholder="user"
                    className="border-slate-300 focus:border-accent focus:ring-accent"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="dbPassword" className="text-base font-medium mb-1 block">Database Password</Label>
                  <p className="text-sm text-slate-500 mb-2">Database password</p>
                  <Input
                    id="dbPassword"
                    type="password"
                    value={config.server.dbPassword}
                    onChange={(e) => onUpdate(section, { ...config[section], dbPassword: e.target.value })}
                    placeholder="Enter database password"
                    className="border-slate-300 focus:border-accent focus:ring-accent"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="dbName" className="text-base font-medium mb-1 block">Database Name</Label>
                  <p className="text-sm text-slate-500 mb-2">Database name</p>
                  <Input
                    id="dbName"
                    value={config.server.dbName}
                    onChange={(e) => onUpdate(section, { ...config[section], dbName: e.target.value })}
                    placeholder="Enter database name"
                    className="border-slate-300 focus:border-accent focus:ring-accent"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Load Balancing</h3>
              <div className="space-y-4">
                <div className="input-group">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loadBalancing.enabled" className="text-base font-medium">Enable Load Balancing</Label>
                      <p className="text-sm text-slate-500 mt-1">Enable Nginx load balancing for high availability</p>
                    </div>
                    <Switch
                      id="loadBalancing.enabled"
                      checked={config.server.loadBalancing.enabled}
                      onCheckedChange={(checked) =>
                        onUpdate(section, {
                          ...config[section],
                          loadBalancing: { ...config.server.loadBalancing, enabled: checked },
                        })
                      }
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                </div>

                {config.server.loadBalancing.enabled && (
                  <>
                    <div className="input-group">
                      <Label htmlFor="loadBalancing.backendKeepAlive" className="text-base font-medium">Backend Keep-Alive</Label>
                      <p className="text-sm text-slate-500 mt-1">Number of persistent connections</p>
                      <Input
                        id="loadBalancing.backendKeepAlive"
                        type="number"
                        value={config.server.loadBalancing.backendKeepAlive}
                        onChange={(e) =>
                          onUpdate(section, {
                            ...config[section],
                            loadBalancing: {
                              ...config.server.loadBalancing,
                              backendKeepAlive: parseInt(e.target.value) || 32,
                            },
                          })
                        }
                        className="mt-2"
                        placeholder="32"
                      />
                    </div>

                    <div className="input-group">
                      <Label htmlFor="loadBalancing.balancingMethod" className="text-base font-medium">Load Balancing Method</Label>
                      <p className="text-sm text-slate-500 mt-1">Algorithm for distributing requests</p>
                      <Select
                        value={config.server.loadBalancing.balancingMethod}
                        onValueChange={(value: "least_conn" | "round_robin" | "ip_hash") =>
                          onUpdate(section, {
                            ...config[section],
                            loadBalancing: {
                              ...config.server.loadBalancing,
                              balancingMethod: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select balancing method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="least_conn">Least Connections</SelectItem>
                          <SelectItem value="round_robin">Round Robin</SelectItem>
                          <SelectItem value="ip_hash">IP Hash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="input-group">
                      <Label htmlFor="loadBalancing.frontendPorts" className="text-base font-medium">Frontend Ports</Label>
                      <p className="text-sm text-slate-500 mt-1">Comma-separated list of frontend server ports</p>
                      <Input
                        id="loadBalancing.frontendPorts"
                        value={config.server.loadBalancing.frontendPorts.join(", ")}
                        onChange={(e) =>
                          onUpdate(section, {
                            ...config[section],
                            loadBalancing: {
                              ...config.server.loadBalancing,
                              frontendPorts: e.target.value.split(",").map((p) => p.trim()),
                            },
                          })
                        }
                        className="mt-2"
                        placeholder="3000, 3001, 3002"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Nginx Configuration</h3>
              <NginxForm 
                data={config.server.nginx} 
                onChange={(data) => onUpdate(section, { ...config[section], nginx: data })} 
              />
            </div>
          </div>
        );
      case "environment":
        return (
          <div className="space-y-4">
            <div className="input-group">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug" className="text-base font-medium">Enable Debug Mode</Label>
                  <p className="text-sm text-slate-500 mt-1">Enable debugging mode for development</p>
                </div>
                <Switch
                  id="debug"
                  checked={config.environment.debug}
                  onCheckedChange={(checked) => onUpdate(section, { debug: checked })}
                  className="data-[state=checked]:bg-accent"
                />
              </div>
            </div>
          </div>
        );
      case "auth":
        return (
          <div className="space-y-4">
            <div className="input-group">
              <Label htmlFor="googleCustomerId" className="text-base font-medium">Google Customer ID</Label>
              <p className="text-sm text-slate-500 mt-1">Google OAuth client ID</p>
              <Input
                id="googleCustomerId"
                value={config.auth.googleCustomerId}
                onChange={(e) => onUpdate(section, { ...config[section], googleCustomerId: e.target.value })}
                placeholder="Your Google Customer ID"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="googleCustomerSecret" className="text-base font-medium">Google Customer Secret</Label>
              <p className="text-sm text-slate-500 mt-1">Google OAuth client secret</p>
              <Input
                id="googleCustomerSecret"
                type="password"
                value={config.auth.googleCustomerSecret}
                onChange={(e) => onUpdate(section, { ...config[section], googleCustomerSecret: e.target.value })}
                placeholder="Your Google Customer Secret"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="googleRedirectUri" className="text-base font-medium">Google Redirect URI</Label>
              <p className="text-sm text-slate-500 mt-1">Google OAuth redirect URI</p>
              <Input
                id="googleRedirectUri"
                value={config.auth.googleRedirectUri}
                onChange={(e) => onUpdate(section, { ...config[section], googleRedirectUri: e.target.value })}
                placeholder="http://localhost:8000/v1/auth/login/google/callback"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="metaClientId" className="text-base font-medium">Meta Client ID</Label>
              <p className="text-sm text-slate-500 mt-1">Meta/Facebook OAuth client ID</p>
              <Input
                id="metaClientId"
                value={config.auth.metaClientId}
                onChange={(e) => onUpdate(section, { ...config[section], metaClientId: e.target.value })}
                placeholder="Your Meta Client ID"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="metaClientSecret" className="text-base font-medium">Meta Client Secret</Label>
              <p className="text-sm text-slate-500 mt-1">Meta/Facebook OAuth client secret</p>
              <Input
                id="metaClientSecret"
                type="password"
                value={config.auth.metaClientSecret}
                onChange={(e) => onUpdate(section, { ...config[section], metaClientSecret: e.target.value })}
                placeholder="Your Meta Client Secret"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="metaRedirectUri" className="text-base font-medium">Meta Redirect URI</Label>
              <p className="text-sm text-slate-500 mt-1">Meta/Facebook OAuth redirect URI</p>
              <Input
                id="metaRedirectUri"
                value={config.auth.metaRedirectUri}
                onChange={(e) => onUpdate(section, { ...config[section], metaRedirectUri: e.target.value })}
                placeholder="http://localhost:8000/v1/auth/login/meta/callback"
              />
            </div>
          </div>
        );
      case "redis":
        return (
          <div className="space-y-4">
            <div className="input-group">
              <Label htmlFor="host" className="text-base font-medium">Redis Host</Label>
              <p className="text-sm text-slate-500 mt-1">The Redis server hostname</p>
              <Input
                id="host"
                value={config.redis.host}
                onChange={(e) => onUpdate(section, { ...config[section], host: e.target.value })}
                placeholder="localhost"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="port" className="text-base font-medium">Redis Port</Label>
              <p className="text-sm text-slate-500 mt-1">The Redis server port</p>
              <Input
                id="port"
                value={config.redis.port}
                onChange={(e) => onUpdate(section, { ...config[section], port: e.target.value })}
                placeholder="6379"
              />
            </div>
          </div>
        );
      case "frontend":
        return (
          <div className="space-y-4">
            <div className="input-group">
              <Label htmlFor="url" className="text-base font-medium">Frontend URL</Label>
              <p className="text-sm text-slate-500 mt-1">The URL of your frontend application</p>
              <Input
                id="url"
                value={config.frontend.url}
                onChange={(e) => onUpdate(section, { ...config[section], url: e.target.value })}
                placeholder="http://localhost:3000"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="host" className="text-base font-medium">Frontend Host</Label>
              <p className="text-sm text-slate-500 mt-1">The host of your frontend application</p>
              <Input
                id="host"
                value={config.frontend.host}
                onChange={(e) => onUpdate(section, { ...config[section], host: e.target.value })}
                placeholder="localhost"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="publicApiUrl" className="text-base font-medium">Public API URL</Label>
              <p className="text-sm text-slate-500 mt-1">The public URL of your API</p>
              <Input
                id="publicApiUrl"
                value={config.frontend.publicApiUrl}
                onChange={(e) => onUpdate(section, { ...config[section], publicApiUrl: e.target.value })}
                placeholder="http://127.0.0.1:8000/"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="secretKey" className="text-base font-medium">Secret Key</Label>
              <p className="text-sm text-slate-500 mt-1">Secret key for encryption</p>
              <Input
                id="secretKey"
                type="password"
                value={config.frontend.secretKey}
                onChange={(e) => onUpdate(section, { ...config[section], secretKey: e.target.value })}
                placeholder="Your Secret Key"
              />
            </div>
            <div className="input-group">
              <Label htmlFor="desktop" className="text-base font-medium mb-1 block">Desktop Framework</Label>
              <p className="text-sm text-slate-500 mb-2">Choose your preferred frontend framework</p>
              <ToggleGroup
                type="single"
                defaultValue={config.frontend.desktop}
                onValueChange={(value) => value && onUpdate(section, { ...config[section], desktop: value })}
                className="flex w-full border rounded-md overflow-hidden"
              >
                <ToggleGroupItem
                  value="REACT"
                  aria-label="React"
                  className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
                >
                  React
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="NEXT"
                  aria-label="Next.js"
                  className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
                >
                  Next.js
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="VITE"
                  aria-label="Vite"
                  className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
                >
                  Vite
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        );
    }
  };

  const sectionTitles: Record<ConfigSection, string> = {
    project: "Project Configuration",
    environment: "Environment Settings",
    server: "Server Configuration",
    auth: "Authentication Settings",
    redis: "Redis Configuration",
    frontend: "Frontend Settings",
  };

  const sectionDescriptions: Record<ConfigSection, string> = {
    project: "Define your project's basic information and setup",
    environment: "Configure environment-specific settings",
    server: "Set up your backend server and database connection",
    auth: "Configure authentication providers and credentials",
    redis: "Set up Redis cache server settings",
    frontend: "Configure your frontend application settings",
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-md border-slate-200">
      <CardHeader className="space-y-1 border-b pb-4">
        <div className="flex items-center space-x-3">
          {sectionIcons[section]}
          <CardTitle className="text-xl text-slate-800">{sectionTitles[section]}</CardTitle>
        </div>
        <CardDescription className="text-slate-500">
          {sectionDescriptions[section]}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormContent()}
          
          <div className="flex justify-between pt-6 border-t mt-6">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={onNext} 
              className="ml-auto gradient-btn text-white"
            >
              {section === "frontend" ? (
                <>Generate .env <CheckIcon className="h-4 w-4 ml-1" /></>
              ) : (
                <>Next Step <ChevronRightIcon className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfigForm;
