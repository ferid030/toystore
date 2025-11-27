import http.server
import socketserver
import mimetypes
import os

PORT = 3000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        base, ext = os.path.splitext(path)
        if ext.lower() == '.js':
            return 'application/javascript'
        return super().guess_type(path)

Handler = MyHandler
# Ensure JS is correct just in case
mimetypes.add_type('application/javascript', '.js')

print(f"Serving at http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
