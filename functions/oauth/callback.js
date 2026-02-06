export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) return new Response("Error: No code provided.", { status: 400 });

    const client_id = env.OAUTH_CLIENT_ID;
    const client_secret = env.OAUTH_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return new Response("Error: Credentials (ID/Secret) missing in Cloudflare.", { status: 500 });
    }

    try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "accept": "application/json",
                "user-agent": "cloudflare-pages-cms-auth"
            },
            body: JSON.stringify({ client_id, client_secret, code }),
        });

        const result = await response.json();

        if (result.error) {
            return new Response(`GitHub API Error: ${result.error_description}`, { status: 400 });
        }

        const token = result.access_token;
        const provider = "github";

        return new Response(
            `<!doctype html>
      <html>
      <head>
        <style>body{font-family:sans-serif;text-align:center;padding:20px;}</style>
      </head>
      <body>
        <h3>Login Successful</h3>
        <p>Sending authentication token to CMS...</p>
        <p id="info" style="color:#666;font-size:12px">Attempting to communicate with opener...</p>
        <script>
          (function() {
            var token = "${token}";
            var provider = "${provider}";
            var msg = "authorization:" + provider + ":success:" + token;
            var origin = window.location.origin;
            var info = document.getElementById("info");

            function sendMsg() {
              if (window.opener) {
                // Send to exact origin
                window.opener.postMessage(msg, origin);
                // Send to wildcard (fallback)
                window.opener.postMessage(msg, "*");
                info.innerText = "Message sent: " + new Date().toLocaleTimeString();
              } else {
                info.innerText = "Error: Parent window lost. Please try logging in again.";
              }
            }

            // Send immediately
            sendMsg();
            
            // Retry every 500ms for 5 seconds
            var count = 0;
            var interval = setInterval(function() {
              sendMsg();
              count++;
              if (count > 10) clearInterval(interval);
            }, 500);

            // Close after 2 seconds (giving time for retry)
            setTimeout(function() {
               window.close();
            }, 2000);
          })()
        </script>
      </body>
      </html>`,
            { headers: { "content-type": "text/html;charset=UTF-8" } }
        );
    } catch (err) {
        return new Response("Server Error: " + err.message, { status: 500 });
    }
}
