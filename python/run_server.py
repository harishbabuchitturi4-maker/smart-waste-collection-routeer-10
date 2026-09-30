"""
Interactive Dashboard Server
Starts a local web server to display the Smart Waste Collection Router visualizer.
"""

import http.server
import socketserver
import os
import webbrowser
import sys

PORT = 8000
WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

def start_server():
    os.chdir(WEB_DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 70)
        print(f" [WEB VISUALIZER] Smart Waste Collection Router (Team 10)")
        print("=" * 70)
        print(f" Dashboard is running at: http://localhost:{PORT}")
        print(f" Press Ctrl+C in this terminal to stop the server.")
        print("=" * 70)
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    start_server()
