# Integración Frontend: Flutter / Dart (Tótem / App Móvil)

Guía completa para conectar una aplicación **Flutter** (diseñada para la pantalla del Tótem o una App móvil de administración) con el backend CQRS de Café Lobo.

---

## 1. Dependencias (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.2
  shared_preferences: ^2.3.2
  provider: ^6.1.2 # o flutter_riverpod / flutter_bloc
```

---

## 2. Modelo de Datos (`producto_model.dart`)

```dart
// lib/models/producto_model.dart
class Producto {
  final dynamic id;
  final String nombre;
  final String? categoria;
  final String? descripcion;
  final double precio;
  final double costo;
  final bool activo;
  final String? loyverseHandle;
  final String? loyverseVariantId;

  Producto({
    required this.id,
    required this.nombre,
    this.categoria,
    this.descripcion,
    required this.precio,
    required this.costo,
    required this.activo,
    this.loyverseHandle,
    this.loyverseVariantId,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id'],
      nombre: json['nombre'] ?? '',
      categoria: json['categoria'],
      descripcion: json['descripcion'],
      precio: (json['precio'] as num?)?.toDouble() ?? 0.0,
      costo: (json['costo'] as num?)?.toDouble() ?? 0.0,
      activo: json['activo'] ?? true,
      loyverseHandle: json['loyverse_handle'] ?? json['loyverse_ref'],
      loyverseVariantId: json['loyverse_variant_id'],
    );
  }
}
```

---

## 3. Servicio de API con Inyección de Token (`api_service.dart`)

```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/producto_model.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:4000/api'; // 10.0.2.2 en emulador Android o IP local para el Tótem

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  Future<Map<String, String>> _headers() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ── Autenticación ──
  Future<bool> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);
      return true;
    }
    return false;
  }

  // ── Catálogo de Productos ──
  Future<List<Producto>> getProductos() async {
    final response = await http.get(
      Uri.parse('$baseUrl/productos'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final List<dynamic> list = jsonDecode(response.body);
      return list.map((json) => Producto.fromJson(json)).toList();
    }
    throw Exception('Error al obtener productos: ${response.statusCode}');
  }

  // ── Nivel 1: Top Productos por Segmento (Tótem) ──
  Future<List<dynamic>> getSugerenciasSegmento(String segmento, String valor) async {
    final response = await http.get(
      Uri.parse('$baseUrl/estadisticas/top-productos?segmento=$segmento&valor=$valor'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['productos'] ?? [];
    }
    return [];
  }

  // ── Nivel 2: Afinidad de Canasta (Venta Cruzada) ──
  Future<Map<String, dynamic>> getAfinidad(String productoId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/estadisticas/afinidad?producto_id=$productoId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return {};
  }
}
```

---

## 4. Widget de Tótem: Sugerencias Cruzadas en Pantalla

```dart
// lib/screens/totem_sugerencia_dialog.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TotemSugerenciaDialog extends StatelessWidget {
  final String productoIdSeleccionado;
  final ApiService api = ApiService();

  TotemSugerenciaDialog({required this.productoIdSeleccionado});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: api.getAfinidad(productoIdSeleccionado),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

        final afines = snapshot.data!['productos_afines'] as List<dynamic>? ?? [];
        if (afines.isEmpty) return const SizedBox.shrink();

        final mejorSugerencia = afines.first;

        return AlertDialog(
          title: const Text('✨ ¿Deseas acompañar tu café?'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Otros clientes suelen agregar: ${mejorSugerencia['nombre']}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              Chip(
                label: Text('${mejorSugerencia['porcentaje_afinidad']} de preferencia'),
                backgroundColor: Colors.amber.shade100,
              )
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('No, gracias'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, mejorSugerencia),
              child: const Text('¡Sí, agregar!'),
            ),
          ],
        );
      },
    );
  }
}
```
