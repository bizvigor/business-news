export default {
  async fetch(request, env, ctx) {
    // FINAL DEBUG ATTEMPT
    // If this fails, the issue is not code, but platform configuration.
    try {
      return new Response("Worker Status: OPERATIONAL\nEnvironment Keys: " + JSON.stringify(Object.keys(env || {})), {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (err) {
      return new Response("Critical Startup Error: " + err.toString(), { status: 500 });
    }
  }
};
