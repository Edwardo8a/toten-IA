"""
Crea el descuento "Tótem" en Loyverse vía API (POST /discounts).

Uso:
  1. Pega tu Personal Access Token abajo, en LOYVERSE_TOKEN.
  2. Ajusta NOMBRE_DESCUENTO / TIPO / VALOR si quieres otra cosa.
  3. python loyverse_crear_descuento.py
  4. Si funciona, imprime el "id" real del descuento — ese es el valor
     que va en DISCOUNT_TOTEM_ID dentro del workflow
     "Totem_Hackathon_LOYVERSE_Canje_v1.json".
  5. Si Loyverse responde con error, el script imprime el mensaje
     completo tal cual lo manda la API — normalmente dice justo qué
     campo está mal o cómo se llama de verdad, y ajustamos el script
     en un solo round-trip en vez de seguir adivinando.

Esto SÍ escribe en tu cuenta real de Loyverse (crea un descuento).
No toca productos, clientes ni recibos.
"""

import json
import requests

# ── Pega tu token aquí ────────────────────────────────────────────
LOYVERSE_TOKEN = "ab94e879ac874f96a15f77bb4d6ee2dd"

# ── Configuración del descuento ───────────────────────────────────
NOMBRE_DESCUENTO = "Tótem"
TIPO_DESCUENTO = "FIXED_PERCENT"   # mejor apuesta, sin confirmar contra doc oficial
VALOR_DESCUENTO = 15                # 15% — ajusta si quieres otro valor

BASE_URL = "https://api.loyverse.com/v1.0"
HEADERS = {
    "Authorization": f"Bearer {LOYVERSE_TOKEN}",
    "Content-Type": "application/json",
}


def main():
    if LOYVERSE_TOKEN.startswith("PEGA_AQUI"):
        raise SystemExit("Pega tu token en LOYVERSE_TOKEN antes de correr esto.")

    print("Consultando tiendas (para aplicar el descuento en las 3)...")
    r = requests.get(f"{BASE_URL}/stores", headers=HEADERS)
    r.raise_for_status()
    store_ids = [s["id"] for s in r.json()["stores"]]
    print(f"  -> {len(store_ids)} tiendas encontradas.")

    payload = {
        "name": NOMBRE_DESCUENTO,
        "type": TIPO_DESCUENTO,
        "discount_percent": VALOR_DESCUENTO,  # best-effort: puede llamarse distinto
        "restricted_access": False,
        "stores": store_ids,
    }

    print("\nCreando descuento con este payload (best-effort):")
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    r = requests.post(f"{BASE_URL}/discounts", headers=HEADERS, json=payload)

    print(f"\nStatus: {r.status_code}")
    try:
        body = r.json()
        print(json.dumps(body, indent=2, ensure_ascii=False))
    except ValueError:
        print(r.text)
        return

    if r.status_code in (200, 201):
        print(f"\n✅ Descuento creado. DISCOUNT_TOTEM_ID = {body.get('id')}")
    else:
        print(
            "\n❌ No se pudo crear con este payload. Manda el bloque de arriba "
            "(status + respuesta) y ajustamos el campo que esté marcando mal — "
            "la respuesta de Loyverse normalmente dice el nombre correcto."
        )


if __name__ == "__main__":
    main()
