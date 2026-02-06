export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new Response("Error: No code provided from GitHub.", { status: 400 });
    }

    const client_id = env.OAUTH_CLIENT_ID;
    const client_secret = env.OAUTH_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return new Response("Error: OAuth credentials missing in Cloudflare.", { status: 500 });
    }

    try {
        // Exchange code for token
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
            return new Response("GitHub Error: " + JSON.stringify(result), { status: 400 });
        }

        const token = result.access_token;
        const provider = "github"; // or 'gitlab', etc.

        // Return HTML that posts the message back to the CMS window
        // This script closes the popup and sends the token to the parent window (the CMS)
        return new Response(
            `<!doctype html><html><body><script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            
            // Send the token to the simpler 'decap-cms' listener
            window.opener.postMessage('authorization:${provider}:success:${token}', e.origin);
            
            // Should properly match the generic netlify-cms listener too
            window.opener.postMessage("authorization:github:success:${token}", e.origin);
          }
          window.addEventListener("message", receiveMessage, false);
          
          // Fire the message immediately
          window.opener.postMessage('authorization:${provider}:success:${token}', '*');
          window.opener.postMessage("authorization:github:success:${token}", '*');
        })()
      </script></body></html>`,
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
