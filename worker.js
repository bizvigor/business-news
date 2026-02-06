export default {
    async fetch(request, env, ctx) {
        try {
            if (!env.ASSETS) {
                return new Response("Error: ASSETS binding is missing. Please check wrangler.json configuration.", { status: 500 });
            }
            return await env.ASSETS.fetch(request);
        } catch (e) {
            return new Response("Worker Runtime Error: " + e.message + "\nStack: " + e.stack, { status: 500 });
        }
    }
};
