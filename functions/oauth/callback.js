export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) return new Response("Error: No code provided from GitHub.", { status: 400 });

    const client_id = env.OAUTH_CLIENT_ID;
    const client_secret = env.OAUTH_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return new Response("Error: OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET is missing. Please check Cloudflare settings.", { status: 500 });
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

        // Return HTML with VISIBLE status
        return new Response(
            `<!doctype html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 20px; text-align: center; }
          .error { color: red; font-weight: bold; }
          .success { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <h3>Authenticating with GitHub...</h3>
        <p id="status">Sending token to CMS...</p>
        <div id="debug" style="color: #666; font-size: 12px; margin-top: 20px;"></div>
        
        <script>
          (function() {
            var token = "${token}";
            var provider = "${provider}";
            var debug = document.getElementById("debug");
            var status = document.getElementById("status");

            try {
              if (window.opener) {
                // Send messages
                window.opener.postMessage('authorization:' + provider + ':success:' + token, window.location.origin);
                window.opener.postMessage("authorization:github:success:" + token, window.location.origin);
                
                status.innerHTML = "<span class='success'>Success! You can close this window.</span>";
                debug.innerText = "Token sent to parent window.";
                
                // Optional: Close auto
                // window.close();
              } else {
                 status.innerHTML = "<span class='error'>Error: Cannot find the login window.</span>";
                 debug.innerText = "window.opener is null. Did you open this in a new tab manually?";
              }
            } catch (err) {
              status.innerHTML = "<span class='error'>Script Error</span>";
              debug.innerText = err.toString();
            }
          })()
        </script>
      </body>
      </html>`,
            {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                },
            }
        );
    } catch (err) {
        return new Response("Server Error: " + err.message, { status: 500 });
    }
}
