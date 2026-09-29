# ADR-004: Port Auto-Detection with Fallback Range

**Status:** ✅ Accepted  
**Date:** 2026-06-20  
**Author:** AI-generated (based on codebase analysis)  

---

## Context

The Repxray server needs a TCP port to listen on. Common scenarios:

- Port 7890 may be in use by another instance or application
- Users may run multiple instances for different projects
- The CLI's `go` command needs to know which port the server is actually using

Options:
- **Fixed port** — Always use 7890, fail if in use
- **Random port** — OS assigns a random available port
- **Port range** — Try a range of ports, use the first available

## Decision

Use a **port range strategy**: try `REPXRAY_PORT` (default: 7890) and increment up to +9 until a free port is found. The server prints `[PORT] <number>` to stdout so the CLI can detect the actual port.

## Rationale

1. **Predictable fallback** — Users know the port will be in range 7890-7899. Random ports are hard to remember.
2. **CLI detection** — The `go` command reads `[PORT] <number>` from server stdout to build the correct `API_URL`.
3. **Simple implementation** — A for loop with try/catch on `app.listen()`. No external port-checking service needed.
4. **Good enough range** — 10 ports is sufficient for a local tool. If all 10 are in use, something else is wrong.

## Consequences

### Positive
- Zero-config port management — users never see "port in use" errors
- The `go` command transparently handles port detection
- Predictable port range for firewall/config purposes

### Negative
- Users who hardcode port 7890 in scripts may break when the server uses a different port
- The `API_URL` env var can override the detected port (users must update it manually if they set it)
- Port scanning is sequential, adding ~100ms per failed attempt

### Code Flow

```javascript
// Server side
for (var i = 0; i < 10; i++) {
    var tryPort = startPort + i;
    try {
        server = await tryListen(tryPort);
        console.log('[PORT] ' + tryPort);
        break;
    } catch (err) {
        if (err.code !== 'EADDRINUSE') throw err;
    }
}

// CLI side (repxray go)
serverProcess.stdout.on('data', function (data) {
    var match = data.toString().match(/\[PORT\]\s+(\d+)/);
    if (match) detectedPort = parseInt(match[1], 10);
});
// Then use detectedPort to build API_URL
```

## References

- `server/src/server.js` — `start()` function with port detection loop
- `src/index.js` — `go()` function that captures `[PORT]` from server stdout
- [`CONTEXT.md`](../../CONTEXT.md) — Environment variables section
