export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) return new Response("Error: No code provided from GitHub.", { status: 400 });

    const client_id = env.OAUTH_CLIENT_ID;
    const client_secret = env.OAUTH_CLIENT_SECRET;

    // DEBUG: Strict check
    if (!client_id || !client_secret) {
        return new Response(
            `Error: Credentials missing in Cloudflare.
       Client ID: ${client_id ? 'OK' : 'MISSING'}
       Client Secret: ${client_secret ? 'OK' : 'MISSING'}
       Please add them in Settings > Environment variables and Redeploy.`,
            { status: 500 }
        );
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
            return new Response(`GitHub API Error: ${result.error_description} (${result.error}) \nSent Client ID: ${client_id.substring(0, 5)}...`, { status: 400 });
        }

        const token = result.access_token;
        const provider = "github";

        return new Response(
            `<!doctype html><html><body><script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage('authorization:${provider}:success:${token}', e.origin);
            window.opener.postMessage("authorization:github:success:${token}", e.origin);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage('authorization:${provider}:success:${token}', '*');
          window.opener.postMessage("authorization:github:success:${token}", '*');
        })()
      </script></body></html>`,
            { headers: { "content-type": "text/html;charset=UTF-8" } }
        );
    } catch (err) {
        return new Response("Server Error: " + err.message, { status: 500 });
    }
}
