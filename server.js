const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

// MIME types mapping
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Static File Server Helper
function serveStaticFile(filePath, res) {
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Archivo No Encontrado');
            return;
        }

        // Directory checking
        if (fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Error de Servidor: ${err.message}`);
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
}

// Git Push Helper function (Async)
function runGitSync() {
    console.log('🔄 Iniciando sincronización con GitHub...');
    exec('git add .', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Error en git add:', err);
            return;
        }
        exec('git commit -m "Actualización automática de contenido y assets mediante Editor Visual"', (err, stdout, stderr) => {
            if (err) {
                // If there are no changes, this is fine
                console.warn('⚠️ Advertencia en git commit (puede no haber cambios):', err.message);
                return;
            }
            console.log('📝 Commit creado con éxito. Ejecutando git push...');
            exec('git push', (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Error en git push:', err);
                    return;
                }
                console.log('🚀 ¡Cambios subidos a GitHub con éxito!');
            });
        });
    });
}

// Create HTTP Server
const server = http.createServer((req, res) => {
    // Enable CORS for ease of access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: Save Content HTML
    if (req.method === 'POST' && req.url === '/api/save-content') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.html) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'HTML no proporcionado.' }));
                    return;
                }

                const targetPath = path.join(__dirname, 'index.html');
                fs.writeFileSync(targetPath, payload.html, 'utf8');
                console.log('💾 Archivo index.html guardado físicamente en disco.');

                // Trigger Git Sync in background
                runGitSync();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Contenido guardado con éxito. Sincronización con GitHub iniciada en segundo plano.' 
                }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: `Error del servidor: ${err.message}` }));
            }
        });
        return;
    }

    // API: Upload Image (Base64)
    if (req.method === 'POST' && req.url === '/api/upload-image') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.filename || !payload.fileData) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Nombre de archivo o datos de imagen faltantes.' }));
                    return;
                }

                // Create assets/uploads directory if it doesn't exist
                const uploadDir = path.join(__dirname, 'assets', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Decode base64 data
                const base64Data = payload.fileData.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');

                // Sanitize filename and append unique timestamp
                const sanitizedName = payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                const uniqueFilename = `${Date.now()}_${sanitizedName}`;
                const fileDiskPath = path.join(uploadDir, uniqueFilename);

                fs.writeFileSync(fileDiskPath, buffer);
                const webPath = `assets/uploads/${uniqueFilename}`;
                
                console.log(`🖼️ Imagen subida guardada en: ${webPath}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    filePath: webPath,
                    message: 'Imagen subida correctamente.' 
                }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: `Error del servidor: ${err.message}` }));
            }
        });
        return;
    }

    // Serve Static Files (Default Router)
    const relativePath = req.url === '/' ? '/index.html' : req.url;
    const cleanPath = relativePath.split('?')[0]; // Remove query params
    const filePath = path.join(__dirname, cleanPath);
    serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
    console.log(`
============================================================
🚀 SERVIDOR DE DESARROLLO VOREAL CUADROS CORRIENDO
============================================================
📍 URL Local: http://localhost:${PORT}
⚙️ Panel Admin: http://localhost:${PORT}/admin.html
🎨 Editor Web: http://localhost:${PORT}/index.html?edit=true

* Nota: El servidor guardará los cambios del editor directamente
  en index.html y sincronizará con tu GitHub automáticamente.
============================================================
`);
});
