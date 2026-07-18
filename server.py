import http.server
import socketserver
import webbrowser
import threading
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SafeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from the directory where this script is located
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def end_headers(self):
        # Enable CORS and caching headers for asset loading
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def launch_browser():
    print(f"[Server] Launching default browser to http://localhost:{PORT}...")
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == "__main__":
    # Ensure correct working directory
    os.chdir(DIRECTORY)
    
    # Run browser trigger in a separate thread so it doesn't block server startup
    threading.Timer(1.2, launch_browser).start()
    
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), SafeHandler) as httpd:
            print("==========================================================")
            print(f"   TEJU'S BIRTHDAY EXPERIENCE - LOCAL SERVER ACTIVE")
            print(f"   URL: http://localhost:{PORT}")
            print("==========================================================")
            print("   * Serve Directory:", DIRECTORY)
            print("   * Press Ctrl+C in this terminal to shut down.")
            print("==========================================================")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down. Have a wonderful birthday celebration!")
        sys.exit(0)
    except Exception as e:
        print(f"\n[Server] Failed to bind to port {PORT}: {e}")
        print("Please check if port 8000 is already in use by another program.")
        sys.exit(1)
