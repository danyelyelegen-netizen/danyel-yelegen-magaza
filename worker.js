export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/products" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM products WHERE active = 1 ORDER BY id DESC"
        ).all();

        const products = (results || []).map((r) => ({
          id: r.id,
          name: r.name,
          price: Number(r.price || 0),
          image_url: r.image_url || "",
          customizable: !!r.customizable,
          text_number: r.text_number || "",
          sizes: safeJson(r.sizes_json, []),
          colors: safeJson(r.colors_json, []),
          active: !!r.active
        }));

        return new Response(JSON.stringify(products), {
          headers: {
            "content-type": "application/json; charset=UTF-8",
            "cache-control": "no-store"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({
          error: "Ürünler alınamadı",
          detail: e?.message || "DB hatası"
        }), {
          status: 500,
          headers: {"content-type": "application/json; charset=UTF-8"}
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};

function safeJson(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
