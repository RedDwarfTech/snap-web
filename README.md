## 一款在线制作照片的应用

### 开始开发

```bash
# 安装依赖
npm install
# 启动
npm run start
```


macOS本机Nginx配置（/System/Volumes/Data/opt/homebrew/etc/nginx/conf.d/snap-web.conf）：

```
server {
        listen 8093;
        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
        }
        location ^~ /ai/ {
            proxy_pass  http://127.0.0.1:11014/ai/;
            proxy_redirect off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        location ^~ /post/ {
            proxy_pass  http://127.0.0.1:11014/post/;
            proxy_redirect off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```

```bash
# 停止nginx
sudo kill -9 `ps -ef|grep nginx  |grep -v grep|awk '{print $2}'`
# 启动nginx
/opt/homebrew/opt/nginx/bin/nginx -c /System/Volumes/Data/opt/homebrew/etc/nginx/nginx.conf
# 重新启动nginx
/opt/homebrew/opt/nginx/bin/nginx -s reload -c /System/Volumes/Data/opt/homebrew/etc/nginx/nginx.conf
# 查看nginx错误日志
tail -f /opt/homebrew/opt/nginx/logs/error.log
```



