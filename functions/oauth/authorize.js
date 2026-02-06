export async function onRequest(context) {
    // 1. Get Environment Vars (User must set these in Cloudflare Dashboard)
    const client_id = context.env.OAUTH_CLIENT_ID;

    if (!client_id) {
        return new Response("Error: OAUTH_CLIENT_ID is missing in Cloudflare Environment Variables.", { status: 500 });
    }

    // 2. Redirect to GitHub
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;

    return Response.redirect(githubAuthUrl, 302);
}
