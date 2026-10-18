#!/usr/bin/env python3
"""Development web server for the game (Python standard library only, no venv needed).

Serves the files the game ships (index.html, css/, js/, assets/) from the project root and answers 404 for
everything else, so .git, .venv and tools/ stay private and a reference to a file that won't ship fails early.
Caching is disabled: a browser refresh (F5) always loads the current files. ES modules need http://, so
opening index.html directly from disk (file://) does not work.

    python3 tools/serve.py                    # http://localhost:8080
    python3 tools/serve.py --port 8000
    python3 tools/serve.py --host 0.0.0.0     # reachable from other devices on the LAN (phone testing)

scripts/startup.sh and scripts/shutdown.sh run it in the background. The browser tools (tools/lib/env.py)
import make_server() and run their own instance on a free port.
"""
import argparse, http.server, posixpath, os, sys, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SHIPPED_DIRS = ('css/', 'js/', 'assets/')   # plus index.html; everything else is 404
TAG = 'aaa-sweeper'                         # X-Served-By header, lets scripts/startup.sh recognise the server


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg'}
    quiet = False
    root = ROOT

    def __init__(self, *a, **k):
        super().__init__(*a, directory=self.root, **k)

    def send_head(self):  # used by GET and HEAD
        rel = posixpath.normpath(urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)).lstrip('/')
        if rel not in ('', '.', 'index.html') and not rel.startswith(SHIPPED_DIRS):
            self.send_error(404, 'Not part of the game (served: index.html, css/, js/, assets/)')
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Served-By', TAG)
        super().end_headers()

    def log_message(self, fmt, *args):
        if not self.quiet:
            super().log_message(fmt, *args)


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):  # the browser cancelling a request is not an error
        if not isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            super().handle_error(request, client_address)


def make_server(host='127.0.0.1', port=8080, quiet=False, root=ROOT):
    """A ready-to-run server (call .serve_forever()). port=0 picks a free port: see .server_address.
    root: folder holding index.html, css/, js/ and assets/ (default: the project)."""
    return Server((host, port), type('QuietHandler' if quiet else 'Handler', (Handler,), {'quiet': quiet, 'root': root}))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--host', default='127.0.0.1', help='interface to listen on (default 127.0.0.1; 0.0.0.0 = all)')
    ap.add_argument('--port', type=int, default=8080)
    a = ap.parse_args()
    srv = make_server(a.host, a.port)
    print(f'serving {ROOT} at http://{"localhost" if a.host in ("127.0.0.1", "0.0.0.0") else a.host}:{a.port}/'
          + ('  (all interfaces)' if a.host == '0.0.0.0' else ''), flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()


if __name__ == '__main__':
    main()
