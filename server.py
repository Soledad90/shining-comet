"""
Warehouse Master AI - Local Development Server
Usage: python server.py
Access: http://localhost:8080
"""

import http.server
import socketserver
import threading
import os
import sys
import signal
import socket

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class WMSHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.webp': 'image/webp',
        '.woff2': 'font/woff2',
    }

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Suppress noisy logs, only show requests
        try:
            msg = format % args
            sys.stdout.write(f"  {msg}\n")
            sys.stdout.flush()
        except Exception:
            pass

    def handle_one_request(self):
        """Override to catch broken pipe / connection reset errors."""
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # Client disconnected, ignore


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Handle requests in separate threads to prevent blocking."""
    allow_reuse_address = True
    daemon_threads = True


def kill_port(port):
    """Kill any process using the specified port (Windows)."""
    try:
        import subprocess
        # Use CMD syntax which works reliably on Windows
        subprocess.run(
            f'cmd /c "for /f ""tokens=5"" %a in (\'netstat -ano ^| findstr :{port} ^| findstr LISTENING\') do taskkill /PID %a /F"',
            shell=True, capture_output=True, timeout=5
        )
    except Exception:
        pass


def is_port_available(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('', port))
            return True
        except OSError:
            return False


def start_server():
    if not is_port_available(PORT):
        print(f"  Port {PORT} is in use. Releasing...")
        kill_port(PORT)
        import time
        time.sleep(1)
        if not is_port_available(PORT):
            print(f"  ERROR: Cannot release port {PORT}.")
            sys.exit(1)

    try:
        httpd = ThreadedHTTPServer(("0.0.0.0", PORT), WMSHandler)

        print()
        print("  ================================================")
        print("  |   Warehouse Master AI - Dev Server            |")
        print("  |----------------------------------------------|")
        print(f"  |   URL: http://localhost:{PORT}                   |")
        print("  |   Press Ctrl+C to stop                       |")
        print("  ================================================")
        print()
        sys.stdout.flush()

        def shutdown(sig, frame):
            print("\n  Server stopped.")
            sys.stdout.flush()
            httpd.shutdown()
            sys.exit(0)

        signal.signal(signal.SIGINT, shutdown)
        signal.signal(signal.SIGTERM, shutdown)

        httpd.serve_forever()

    except OSError as e:
        print(f"  ERROR: {e}")
        sys.exit(1)


if __name__ == '__main__':
    os.chdir(DIRECTORY)
    start_server()
