---
notion-id: 1cc02d25-148c-8072-94f0-c98a1b097502
---
### 🧭 Step 1: URL Parsing

When you type a URL, the browser parses it into components:

- **Protocol:** `https`
- **Hostname:** `www.example.com`
- **Path:** `/` (or whatever follows the domain)
- **Port (optional):** Defaults to 443 for HTTPS or 80 for HTTP

> 🎯 The goal is to resolve the hostname to an IP address.

---

### 📡 Step 2: DNS Resolution (How we find the server's IP)

The browser checks if the IP address for `www.example.com` is already cached. There are multiple cache layers:

1. **Browser cache**
2. **OS cache**
3. **Local DNS resolver (usually from your ISP)**
4. If not found, the resolver performs a recursive lookup:
    - **Root DNS server** → returns `.com` nameserver
    - **TLD server (.com)** → returns nameserver for `example.com`
    - **Authoritative nameserver** for `example.com` → returns the IP address for `www.example.com`

💡 *This ends with the browser obtaining the correct IP address (e.g., *`*93.184.216.34*`*).*

---

### 🚪 Step 3: Establishing a Connection (TCP & TLS)

5. The browser uses the resolved IP to initiate a **TCP connection** (3-way handshake) to the server's IP on port 443 (for HTTPS).
6. Then, it performs a **TLS handshake** to establish a secure connection:
    - Server presents its TLS certificate
    - Browser verifies it (via Certificate Authority)
    - Session keys are negotiated

> 🎯 At this point, the browser and server can securely exchange data.

---

### ✉️ Step 4: Sending the HTTP Request

The browser sends an HTTP(S) request like:

```plain text
http
CopyEdit
GET / HTTP/1.1
Host: www.example.com
...


```

This request is sent over the secure TCP/TLS connection.

---

### 📥 Step 5: Receiving the Response

The server processes the request and sends back a response, e.g., an HTML page:

```plain text
http
CopyEdit
HTTP/1.1 200 OK
Content-Type: text/html
...


```

The browser receives it and starts rendering.

---

### 📄 Step 6: Rendering the Page

7. Browser parses the HTML
8. Requests other resources (CSS, JS, images) – each of these may repeat parts of the DNS & connection steps
9. Executes JS, applies styles, renders UI