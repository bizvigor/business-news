export default {
    async fetch(request, env, ctx) {
        // Serve static assets from the binding
        return env.ASSETS.fetch(request);
    }
};
