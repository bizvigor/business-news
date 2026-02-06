export default {
    async fetch(request, env, ctx) {
        // DEBUG: Minimal response to test Worker runtime
        console.log("Worker started. Env keys:", Object.keys(env));

        // Temporarily bypass asset fetching to test basic connectivity
        return new Response("Debug: Worker is running! \nEnv Keys: " + JSON.stringify(Object.keys(env)), {
            headers: { "content-type": "text/plain" }
        });

        /* 
        // OLD CODE - COMMENTED OUT FOR DEBUGGING
        try {
          if (!env.ASSETS) {
             return new Response("Error: ASSETS binding is missing.", { status: 500 });
          }
          return await env.ASSETS.fetch(request);
        } catch (e) {
          return new Response("Worker Runtime Error: " + e.message, { status: 500 });
        }
        */
    }
};
