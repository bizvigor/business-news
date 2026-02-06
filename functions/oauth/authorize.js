export async function onRequest(context) {
    const client_id = context.env.OAUTH_CLIENT_ID;

    // DEBUG: Strict check
    if (!client_id || client_id.length < 5) {
        return new Response(
            `Error: OAUTH_CLIENT_ID is missing or invalid in Cloudflare Env Vars.
       Current Value: '${client_id}' (Type: ${typeof client_id})
       Please go to Pages Settings > Environment variables and add OAUTH_CLIENT_ID.
       Then Create a New Deployment.`,
            { status: 500 }
        );
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
    return Response.redirect(githubAuthUrl, 302);
}
